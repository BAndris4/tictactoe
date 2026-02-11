from django.db import transaction
from ..models import PlayerProfile

class RankingService:
    STARTING_MMR = 1000
    STABILIZATION_GAMES = 50
    K_START = 50
    K_STABLE = 20

    @classmethod
    def get_k_factor(cls, games_played: int) -> int:
        if games_played < 10:
            return 80
        if games_played >= cls.STABILIZATION_GAMES:
            return cls.K_STABLE
        k_diff = cls.K_START - cls.K_STABLE
        decay = k_diff * (games_played / cls.STABILIZATION_GAMES)
        return int(round(cls.K_START - decay))

    @classmethod
    def calculate_expected_score(cls, rating_a: int, rating_b: int) -> float:
        return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))

    STARTING_LP = 200
    BASE_LP_CHANGE = 20
    LP_PER_DIVISION = 100
    STREAK_BONUS = 5
    
    RANKS = [
        "Bronze 1", "Bronze 2", "Bronze 3",
        "Silver 1", "Silver 2", "Silver 3",
        "Gold 1",   "Gold 2",   "Gold 3",
        "Master"
    ]

    @classmethod
    def get_rank_from_lp(cls, total_lp: int, games_played: int = 10):
        if games_played < 10:
            return "Unranked", 0
        if total_lp < 0:
            total_lp = 0
        division_index = total_lp // cls.LP_PER_DIVISION
        lp_in_division = total_lp % cls.LP_PER_DIVISION
        if division_index >= len(cls.RANKS):
            return cls.RANKS[-1], total_lp - (len(cls.RANKS) - 1) * cls.LP_PER_DIVISION
        return cls.RANKS[int(division_index)], lp_in_division

    @classmethod
    def get_tier_floor(cls, total_lp: int) -> int:
        tier_index = (total_lp // cls.LP_PER_DIVISION) // 3
        return tier_index * 3 * cls.LP_PER_DIVISION

    @classmethod
    def calculate_expected_mmr_for_lp(cls, total_lp: int) -> int:
        return (1000 - cls.STARTING_LP) + total_lp

    @classmethod
    def process_game_end(cls, game):
        if game.status != 'finished':
            return {}
        profile_x = None
        profile_o = None
        if game.player_x:
            profile_x, _ = PlayerProfile.objects.get_or_create(user=game.player_x)
        if game.player_o:
            profile_o, _ = PlayerProfile.objects.get_or_create(user=game.player_o)

        change_x_mmr = 0
        change_o_mmr = 0
        change_x_lp = 0
        change_o_lp = 0

        if game.rated and profile_x and profile_o:
            score_x = 1.0 if game.winner == 'X' else (0.5 if game.winner == 'D' else 0.0)
            score_o = 1.0 - score_x
            
            mmr_x = profile_x.mmr if profile_x.mmr is not None else cls.STARTING_MMR
            mmr_o = profile_o.mmr if profile_o.mmr is not None else cls.STARTING_MMR
            
            expected_x = cls.calculate_expected_score(mmr_x, mmr_o)
            expected_o = cls.calculate_expected_score(mmr_o, mmr_x)
            k_x = cls.get_k_factor(profile_x.placement_games_played)
            k_o = cls.get_k_factor(profile_o.placement_games_played)
            
            change_x_mmr = int(round(k_x * (score_x - expected_x)))
            change_o_mmr = int(round(k_o * (score_o - expected_o)))
            
            def calculate_lp_update(score, profile, change_mmr):
                current_lp = profile.total_lp if profile.total_lp is not None else cls.STARTING_LP
                current_mmr = profile.mmr if profile.mmr is not None else cls.STARTING_MMR
                games_played = profile.placement_games_played + 1
                
                if games_played < 10:
                    return 0, False
                if games_played == 10:
                    target_lp = max(0, (current_mmr + change_mmr) - (1000 - cls.STARTING_LP))
                    seeded_lp = max(0, target_lp - 150)
                    return seeded_lp - current_lp, False

                expected_mmr = cls.calculate_expected_mmr_for_lp(current_lp)
                mmr_diff = (current_mmr + change_mmr) - expected_mmr
                correction = int(mmr_diff / 25)
                
                if score == 0.5:
                    return correction, False 
                
                base = cls.BASE_LP_CHANGE if score == 1.0 else -cls.BASE_LP_CHANGE
                streak_bonus = cls.STREAK_BONUS if score == 1.0 and profile.current_streak >= 2 else 0
                lp_change = base + correction + streak_bonus
                final_change = max(10, lp_change) if score == 1.0 else min(-10, lp_change)
                
                new_total_lp = current_lp + final_change
                old_tier_floor = cls.get_tier_floor(current_lp)
                
                if new_total_lp < old_tier_floor:
                    if profile.demotion_shield > 0:
                        final_change = old_tier_floor - current_lp
                        return final_change, True
                
                return final_change, False

            change_x_lp, used_shield_x = calculate_lp_update(score_x, profile_x, change_x_mmr)
            change_o_lp, used_shield_o = calculate_lp_update(score_o, profile_o, change_o_mmr)

            with transaction.atomic():
                profile_x.refresh_from_db()
                profile_o.refresh_from_db()
                for p in [profile_x, profile_o]:
                    if p.mmr is None: p.mmr = cls.STARTING_MMR
                    if p.total_lp is None: p.total_lp = cls.STARTING_LP
                
                if game.winner == 'X':
                    profile_x.current_streak = (profile_x.current_streak + 1) if profile_x.current_streak >= 0 else 1
                    profile_o.current_streak = (profile_o.current_streak - 1) if profile_o.current_streak <= 0 else -1
                elif game.winner == 'O':
                    profile_o.current_streak = (profile_o.current_streak + 1) if profile_o.current_streak >= 0 else 1
                    profile_x.current_streak = (profile_x.current_streak - 1) if profile_x.current_streak <= 0 else -1
                elif game.winner == 'D':
                    profile_x.current_streak = 0
                    profile_o.current_streak = 0

                profile_x.mmr += change_x_mmr
                profile_o.mmr += change_o_mmr
                
                old_tier_x = cls.get_tier_floor(profile_x.total_lp)
                old_tier_o = cls.get_tier_floor(profile_o.total_lp)
                
                profile_x.total_lp = max(0, profile_x.total_lp + change_x_lp)
                profile_o.total_lp = max(0, profile_o.total_lp + change_o_lp)
                
                if cls.get_tier_floor(profile_x.total_lp) > old_tier_x: profile_x.demotion_shield = 3
                if cls.get_tier_floor(profile_o.total_lp) > old_tier_o: profile_o.demotion_shield = 3
                     
                if used_shield_x: profile_x.demotion_shield = max(0, profile_x.demotion_shield - 1)
                if used_shield_o: profile_o.demotion_shield = max(0, profile_o.demotion_shield - 1)

                profile_x.placement_games_played += 1
                profile_o.placement_games_played += 1
                profile_x.save()
                profile_o.save()
                
                game.player_x_mmr_change = change_x_mmr
                game.player_o_mmr_change = change_o_mmr
                game.player_x_lp_change = change_x_lp
                game.player_o_lp_change = change_o_lp
                game.save()

        res = {'mmr': {}, 'lp': {}, 'ranks': {}}
        for p_idx, profile, c_mmr, c_lp in [('x', profile_x, change_x_mmr, change_x_lp), ('o', profile_o, change_o_mmr, change_o_lp)]:
            player_obj = getattr(game, f'player_{p_idx}')
            if not player_obj or not profile: continue
            uid_str = str(player_obj.id)
            res['mmr'][uid_str] = c_mmr
            res['lp'][uid_str] = c_lp
            cur_lp = profile.total_lp if profile.total_lp is not None else cls.STARTING_LP
            games_p = profile.placement_games_played
            old_lp = max(0, cur_lp - c_lp)
            rank_old, lp_old_div = cls.get_rank_from_lp(old_lp, games_p - 1)
            rank_new, lp_new_div = cls.get_rank_from_lp(cur_lp, games_p)
            perf = "Stable"
            if profile.current_streak >= 3: perf = "Hot Streak"
            elif profile.demotion_shield > 0 and cur_lp == cls.get_tier_floor(cur_lp): perf = "Shield Active"
            elif games_p <= 10: perf = "Placement"

            res['ranks'][uid_str] = {
                'old_rank': rank_old, 'new_rank': rank_new,
                'old_lp_div': lp_old_div, 'new_lp_div': lp_new_div,
                'is_change': rank_old != rank_new,
                'streak': profile.current_streak,
                'performance_status': perf,
                'placement_games': games_p,
                'shield': profile.demotion_shield
            }
        return res

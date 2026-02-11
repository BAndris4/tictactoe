from django.db import transaction
from .models import PlayerProfile

class RankingService:
    STARTING_MMR = 1000
    STABILIZATION_GAMES = 50
    
    # K-factors
    K_START = 50
    K_STABLE = 20

    @classmethod
    def get_k_factor(cls, games_played: int) -> int:
        if games_played < 10:
            return 80 # Highly volatile during placement
        if games_played >= cls.STABILIZATION_GAMES:
            return cls.K_STABLE
        
        # Linear decay from K_START to K_STABLE
        k_diff = cls.K_START - cls.K_STABLE
        decay = k_diff * (games_played / cls.STABILIZATION_GAMES)
        return int(round(cls.K_START - decay))

    @classmethod
    def calculate_expected_score(cls, rating_a: int, rating_b: int) -> float:
        """
        Calculates the expected score for player A against player B.
        Formula: 1 / (1 + 10 ^ ((Rb - Ra) / 400))
        """
        return 1 / (1 + 10 ** ((rating_b - rating_a) / 400))


    # LP Constants
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
        """
        Returns rank name and LP within division.
        Example: 350 LP -> (Silver 1, 50)
        """
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
        """
        Returns the LP floor for the current Tier (e.g. Silver starts at 300).
        Tiers are every 3 divisions (300 LP).
        """
        tier_index = (total_lp // cls.LP_PER_DIVISION) // 3
        return tier_index * 3 * cls.LP_PER_DIVISION

    @classmethod
    def calculate_expected_mmr_for_lp(cls, total_lp: int) -> int:
        """
        Calibrated so that STARTING_LP (200) corresponds to 1000 MMR.
        Formula: (1000 - STARTING_LP) + total_lp
        If STARTING_LP = 200, then 800 + 200 = 1000 MMR.
        """
        return (1000 - cls.STARTING_LP) + total_lp

    @classmethod
    def process_game_end(cls, game):
        """
        Calculates and updates MMR and LP for a finished game.
        Returns a dict with changes and rank info.
        """
        if game.status != 'finished':
            return {}
            
        # Get profiles for both players if they exist
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

        # Only calculate changes if the game is rated
        if game.rated and profile_x and profile_o:
            # Calculate scores
            score_x = 0.5
            if game.winner == 'X':
                score_x = 1.0
            elif game.winner == 'O':
                score_x = 0.0
            score_o = 1.0 - score_x
            
            # 1. MMR Calculations
            mmr_x = profile_x.mmr if profile_x.mmr is not None else cls.STARTING_MMR
            mmr_o = profile_o.mmr if profile_o.mmr is not None else cls.STARTING_MMR
            
            expected_x = cls.calculate_expected_score(mmr_x, mmr_o)
            expected_o = cls.calculate_expected_score(mmr_o, mmr_x)
            k_x = cls.get_k_factor(profile_x.placement_games_played)
            k_o = cls.get_k_factor(profile_o.placement_games_played)
            
            change_x_mmr = int(round(k_x * (score_x - expected_x)))
            change_o_mmr = int(round(k_o * (score_o - expected_o)))
            
            # 2. LP & Shield Logic - Helper Function
            def calculate_lp_update(score, profile, change_mmr):
                current_lp = profile.total_lp if profile.total_lp is not None else cls.STARTING_LP
                current_mmr = profile.mmr if profile.mmr is not None else cls.STARTING_MMR
                # Note: profile.placement_games_played is NOT updated yet here, so check +1
                games_played = profile.placement_games_played + 1
                
                # A) Placement Phase (0-9 games)
                if games_played < 10:
                    # In placement, LP changes are internal/hidden or zero until game 10?
                    # Plan: Keep tracking LP internally but reset/seed at game 10.
                    # Actually, if we reset at game 10 based on MMR, we don't need to track LP precisely now.
                    # But let's track it loosely.
                    return 0, False # No visual LP change during placement

                # B) Placement Seeding (Game 10)
                if games_played == 10:
                    # Seed LP based on MMR - Penalty
                    # E.g. MMR 1200 -> LP 400 (Silver 4). Penalty -100 -> LP 300 (Bronze 1).
                    target_lp = max(0, (current_mmr + change_mmr) - (1000 - cls.STARTING_LP))
                    seeded_lp = max(0, target_lp - 150) # "Checkered Flag" penalty
                    # Return diff to reach seeded_lp
                    return seeded_lp - current_lp, False

                # C) Normal Ranked & Shield Logic
                expected_mmr = cls.calculate_expected_mmr_for_lp(current_lp)
                mmr_diff = (current_mmr + change_mmr) - expected_mmr # Use updated MMR estimate
                correction = int(mmr_diff / 25) # Damped correction
                
                if score == 0.5:
                    return correction, False 
                
                base = cls.BASE_LP_CHANGE if score == 1.0 else -cls.BASE_LP_CHANGE
                
                # Streak Bonus
                streak_bonus = 0
                if score == 1.0 and profile.current_streak >= 2: # Will be 3 after this win
                     streak_bonus = cls.STREAK_BONUS

                lp_change = base + correction + streak_bonus
                final_change = max(10, lp_change) if score == 1.0 else min(-10, lp_change)
                
                # --- Demotion Shield Logic ---
                new_total_lp = current_lp + final_change
                
                # Check for Tier Drop (e.g. crossing 400, 800 boundaries downwards)
                old_tier_floor = cls.get_tier_floor(current_lp)
                new_tier_floor = cls.get_tier_floor(new_total_lp)
                
                if new_total_lp < old_tier_floor:
                    # Dropping a Tier (e.g. Silver -> Bronze)
                    if profile.demotion_shield > 0:
                        # Shield Active! Clamp to Floor.
                        final_change = old_tier_floor - current_lp # Reduces LP exactly to floor
                        # We will decrement shield in the update step
                        return final_change, True # Signal shield usage
                
                return final_change, False

            change_x_lp, used_shield_x = calculate_lp_update(score_x, profile_x, change_x_mmr)
            change_o_lp, used_shield_o = calculate_lp_update(score_o, profile_o, change_o_mmr)

            # Update Profiles
            with transaction.atomic():
                profile_x.refresh_from_db()
                profile_o.refresh_from_db()
                if profile_x.mmr is None: profile_x.mmr = cls.STARTING_MMR
                if profile_o.mmr is None: profile_o.mmr = cls.STARTING_MMR
                if profile_x.total_lp is None: profile_x.total_lp = cls.STARTING_LP
                if profile_o.total_lp is None: profile_o.total_lp = cls.STARTING_LP
                
                # 1. Update Streaks first
                if game.winner == 'X':
                    profile_x.current_streak = (profile_x.current_streak + 1) if profile_x.current_streak >= 0 else 1
                    profile_o.current_streak = (profile_o.current_streak - 1) if profile_o.current_streak <= 0 else -1
                elif game.winner == 'O':
                    profile_o.current_streak = (profile_o.current_streak + 1) if profile_o.current_streak >= 0 else 1
                    profile_x.current_streak = (profile_x.current_streak - 1) if profile_x.current_streak <= 0 else -1
                elif game.winner == 'D':
                    profile_x.current_streak = 0
                    profile_o.current_streak = 0

                # 2. Update MMR
                profile_x.mmr += change_x_mmr
                profile_o.mmr += change_o_mmr
                
                # 3. Handle LP & Shield Updates
                old_tier_x = cls.get_tier_floor(profile_x.total_lp)
                old_tier_o = cls.get_tier_floor(profile_o.total_lp)
                
                profile_x.total_lp = max(0, profile_x.total_lp + change_x_lp)
                profile_o.total_lp = max(0, profile_o.total_lp + change_o_lp)
                
                # Check Promotions (Grant Shield)
                new_tier_x = cls.get_tier_floor(profile_x.total_lp)
                new_tier_o = cls.get_tier_floor(profile_o.total_lp)
                
                if new_tier_x > old_tier_x:
                     profile_x.demotion_shield = 3 # Grant 3 shields on promotion
                if new_tier_o > old_tier_o:
                     profile_o.demotion_shield = 3
                     
                # Decrement Shield if used
                if used_shield_x:
                    profile_x.demotion_shield = max(0, profile_x.demotion_shield - 1)
                if used_shield_o:
                    profile_o.demotion_shield = max(0, profile_o.demotion_shield - 1)

                profile_x.placement_games_played += 1
                profile_o.placement_games_played += 1
                profile_x.save()
                profile_o.save()
                
                game.player_x_mmr_change = change_x_mmr
                game.player_o_mmr_change = change_o_mmr
                game.player_x_lp_change = change_x_lp
                game.player_o_lp_change = change_o_lp
                game.save()

        # Build final Results
        res = {
            'mmr': {},
            'lp': {},
            'ranks': {}
        }
        
        for p_idx, profile, change_mmr, change_lp in [('x', profile_x, change_x_mmr, change_x_lp), ('o', profile_o, change_o_mmr, change_o_lp)]:
            player_obj = getattr(game, f'player_{p_idx}')
            if not player_obj or not profile:
                continue
                
            uid_str = str(player_obj.id)
            res['mmr'][uid_str] = change_mmr
            res['lp'][uid_str] = change_lp
            
            # Rank info
            cur_lp = profile.total_lp if profile.total_lp is not None else cls.STARTING_LP
            games_p = profile.placement_games_played
            
            # Recalculate old LP for display comparison?
            # Actually frontend just needs current state + change
            
            old_lp = max(0, cur_lp - change_lp)
            
            # Pass games_played logic to get_rank
            rank_old, lp_old_div = cls.get_rank_from_lp(old_lp, games_p - 1)
            rank_new, lp_new_div = cls.get_rank_from_lp(cur_lp, games_p)
            
            perf = "Stable"
            if profile.current_streak >= 3:
                perf = "Hot Streak"
            elif profile.demotion_shield > 0 and cur_lp == cls.get_tier_floor(cur_lp):
                 perf = "Shield Active"
            elif games_p <= 10:
                 perf = "Placement"

            res['ranks'][uid_str] = {
                'old_rank': rank_old,
                'new_rank': rank_new,
                'old_lp_div': lp_old_div,
                'new_lp_div': lp_new_div,
                'is_change': rank_old != rank_new,
                'streak': profile.current_streak,
                'performance_status': perf,
                'placement_games': games_p,
                'shield': profile.demotion_shield
            }
        
        return res

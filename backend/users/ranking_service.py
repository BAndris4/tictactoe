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
    
    RANKS = [
        "Bronze 1", "Bronze 2", "Bronze 3",
        "Silver 1", "Silver 2", "Silver 3",
        "Gold 1", "Gold 2", "Gold 3",
        "Master"
    ]

    @classmethod
    def get_rank_from_lp(cls, total_lp: int):
        """
        Returns rank name and LP within division.
        Example: 350 LP -> (Silver 2, 50)
        """
        if total_lp < 0:
            total_lp = 0
            
        division_index = total_lp // cls.LP_PER_DIVISION
        lp_in_division = total_lp % cls.LP_PER_DIVISION
        
        if division_index >= len(cls.RANKS):
            return cls.RANKS[-1], total_lp - (len(cls.RANKS) - 1) * cls.LP_PER_DIVISION
            
        return cls.RANKS[int(division_index)], lp_in_division

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
            
            # 2. LP Calculations
            def calculate_lp_change(score, current_mmr, current_lp):
                lp_val = current_lp if current_lp is not None else cls.STARTING_LP
                mmr_val = current_mmr if current_mmr is not None else cls.STARTING_MMR
                expected_mmr = cls.calculate_expected_mmr_for_lp(lp_val)
                diff = mmr_val - expected_mmr
                correction = int(diff / 20)
                
                if score == 0.5:
                    # Draw: Just the correction (drift towards MMR)
                    # "lp szempontjából az mmr felé tolódik, nem sok tehát az alap az +0 LP + tolódás"
                    return correction 
                
                base = cls.BASE_LP_CHANGE if score == 1.0 else -cls.BASE_LP_CHANGE
                lp_change = base + correction
                return max(10, lp_change) if score == 1.0 else min(-10, lp_change)

            change_x_lp = calculate_lp_change(score_x, profile_x.mmr, profile_x.total_lp)
            change_o_lp = calculate_lp_change(score_o, profile_o.mmr, profile_o.total_lp)

            # Update Profiles
            with transaction.atomic():
                profile_x.refresh_from_db()
                profile_o.refresh_from_db()
                if profile_x.mmr is None: profile_x.mmr = cls.STARTING_MMR
                if profile_o.mmr is None: profile_o.mmr = cls.STARTING_MMR
                if profile_x.total_lp is None: profile_x.total_lp = cls.STARTING_LP
                if profile_o.total_lp is None: profile_o.total_lp = cls.STARTING_LP
                
                # 1. Update Streaks
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
                profile_x.total_lp = max(0, profile_x.total_lp + change_x_lp)
                profile_o.total_lp = max(0, profile_o.total_lp + change_o_lp)
                profile_x.placement_games_played += 1
                profile_o.placement_games_played += 1
                profile_x.save()
                profile_o.save()
                
                game.player_x_mmr_change = change_x_mmr
                game.player_o_mmr_change = change_o_mmr
                game.player_x_lp_change = change_x_lp
                game.player_o_lp_change = change_o_lp
                game.save()

        # Build final Results (with Fallbacks for Unrated)
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
            
            # Rank info (current even if no change)
            cur_lp = profile.total_lp if profile.total_lp is not None else cls.STARTING_LP
            old_lp = max(0, cur_lp - change_lp)
            
            rank_old, lp_old_div = cls.get_rank_from_lp(old_lp)
            rank_new, lp_new_div = cls.get_rank_from_lp(cur_lp)
            
            expected_mmr = cls.calculate_expected_mmr_for_lp(cur_lp)
            current_mmr = profile.mmr if profile.mmr is not None else cls.STARTING_MMR
            mmr_diff = current_mmr - expected_mmr
            if mmr_diff > 100:
                perf = "Climbing"
            elif mmr_diff < -100:
                perf = "High LP"
            else:
                perf = "Stable"

            res['ranks'][uid_str] = {
                'old_rank': rank_old,
                'new_rank': rank_new,
                'old_lp_div': lp_old_div,
                'new_lp_div': lp_new_div,
                'is_change': rank_old != rank_new,
                'streak': profile.current_streak,
                'performance_status': perf
            }
        
        return res

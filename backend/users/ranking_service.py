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

    @classmethod
    def process_game_end(cls, game):
        """
        Calculates and updates MMR for a finished game.
        Returns a dict with mmr changes: { player_id: change_amount }
        """
        if not game.rated or game.status != 'finished':
            return {}
            
        # Ensure we have both players (just in case)
        if not game.player_x or not game.player_o:
            return {}
            
        # Get profiles
        profile_x, _ = PlayerProfile.objects.get_or_create(user=game.player_x)
        profile_o, _ = PlayerProfile.objects.get_or_create(user=game.player_o)
        
        # Calculate actual scores
        # Winner: 1.0, Loser: 0.0, Draw: 0.5
        score_x = 0.5
        if game.winner == 'X':
            score_x = 1.0
        elif game.winner == 'O':
            score_x = 0.0
            
        score_o = 1.0 - score_x
        
        # Calculate expected scores
        expected_x = cls.calculate_expected_score(profile_x.mmr, profile_o.mmr)
        expected_o = cls.calculate_expected_score(profile_o.mmr, profile_x.mmr)
        
        # Get K-factors
        k_x = cls.get_k_factor(profile_x.placement_games_played)
        k_o = cls.get_k_factor(profile_o.placement_games_played)
        
        # Calculate new ratings
        change_x = int(round(k_x * (score_x - expected_x)))
        change_o = int(round(k_o * (score_o - expected_o)))
        
        # Update Profiles (Atomic)
        with transaction.atomic():
            # Refresh from DB to be safe
            profile_x.refresh_from_db()
            profile_o.refresh_from_db()
            
            profile_x.mmr += change_x
            profile_o.mmr += change_o
            
            # Increment games played counters
            profile_x.placement_games_played += 1
            profile_o.placement_games_played += 1
            
            profile_x.save()
            profile_o.save()
            
            # Update Game model with changes
            game.player_x_mmr_change = change_x
            game.player_o_mmr_change = change_o
            game.save()
            
        return {
            game.player_x.id: change_x,
            game.player_o.id: change_o
        }

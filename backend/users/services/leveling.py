from django.db import transaction

class LevelingService:
    X_PARAM = 0.0063
    Y_PARAM = 1.027

    @classmethod
    def get_xp_required_for_level(cls, level):
        return min([int((level / cls.X_PARAM) ** cls.Y_PARAM), 5000])

    @classmethod
    def get_level_from_total_xp(cls, total_xp):
        level = 1
        remaining_xp = total_xp
        while True:
            needed = cls.get_xp_required_for_level(level)
            if remaining_xp >= needed:
                remaining_xp -= needed
                level += 1
            else:
                break
        return level

    @classmethod
    def get_xp_in_level_from_total_xp(cls, total_xp):
        level = 1
        remaining_xp = total_xp
        while True:
            needed = cls.get_xp_required_for_level(level)
            if remaining_xp >= needed:
                remaining_xp -= needed
                level += 1
            else:
                break
        return remaining_xp

    @staticmethod
    def calculate_stats_and_xp(game, player_char):
        from games.models import GameMove
        from games.logic import GameLogic
        moves_count = GameMove.objects.filter(game=game, player=player_char).count()
        
        mini_wins = 0
        for i in range(9):
            if GameLogic.check_subboard_winner(game.id, i) == player_char:
                mini_wins += 1
                
        xp = moves_count * 5 + mini_wins * 20      
        
        from games.logic import GameLogic
        winner = GameLogic.get_winner(game.id)
        
        if winner == player_char:
            xp += 100
        elif winner == 'D':
            xp += 75
        else:
            xp += 50
            
        if game.mode == 'local':
            xp = 0
        elif game.mode == 'custom':
            xp = int(xp / 4)
            
        return xp

    @classmethod
    def process_game_end(cls, game):
        results = {}
        players = []
        if game.player_x: players.append((game.player_x, 'X'))
        if game.player_o: players.append((game.player_o, 'O'))

        for user, char in players:
            from ..models import PlayerProfile
            profile, _ = PlayerProfile.objects.get_or_create(user=user)
            
            with transaction.atomic():
                xp_gained = cls.calculate_stats_and_xp(game, char)
                profile.total_xp += xp_gained
                
                if char == 'X':
                    game.player_x_xp_gained = xp_gained
                else:
                    game.player_o_xp_gained = xp_gained
                
                profile.save()

                results[user.id] = {
                    'xp_gained': xp_gained,
                    'new_level': profile.level,
                    'current_xp': profile.xp_in_level,
                    'next_level_xp': cls.get_xp_required_for_level(profile.level),
                    'xp_to_next': cls.get_xp_required_for_level(profile.level) - profile.xp_in_level,
                    'can_play_ranked': profile.can_play_ranked
                }
        
        game.save()
        return results

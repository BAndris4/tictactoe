import pytest
from games.models import Game, GameMove
from games.services.bot.easy import EasyBotLogic
from games.services.bot.medium import MediumBotLogic
from games.services.bot.hard import HardBotLogic

@pytest.mark.django_db
class TestBotLogic:
    def test_easy_bot_attack(self, create_user):
        user = create_user()
        game = Game.objects.create(player_x=user, mode='bot_easy', status='active', current_turn='O')
        
        # Scenario: O can win subboard 0 if it plays in subcell 2 (0, 1 already have O)
        GameMove.objects.create(game=game, move_no=1, player='O', cell=0, subcell=0)
        GameMove.objects.create(game=game, move_no=2, player='X', cell=0, subcell=8)
        GameMove.objects.create(game=game, move_no=3, player='O', cell=0, subcell=1)
        GameMove.objects.create(game=game, move_no=4, player='X', cell=1, subcell=0)
        
        game.next_board_constraint = 0
        game.move_count = 4
        game.save()
        
        move = EasyBotLogic.perform_move(game.id)
        assert move is not None
        assert move.cell == 0
        assert move.subcell == 2 # EasyBot should attack and win the subboard

    def test_easy_bot_defense(self, create_user):
        user = create_user()
        game = Game.objects.create(player_x=user, mode='bot_easy', status='active', current_turn='O')
        
        # Scenario: X can win subboard 0 if it plays in subcell 2. O should block.
        GameMove.objects.create(game=game, move_no=1, player='X', cell=0, subcell=0)
        GameMove.objects.create(game=game, move_no=2, player='O', cell=0, subcell=8)
        GameMove.objects.create(game=game, move_no=3, player='X', cell=0, subcell=1)
        GameMove.objects.create(game=game, move_no=4, player='O', cell=1, subcell=0)
        
        game.next_board_constraint = 0
        game.move_count = 4
        game.save()
        
        move = EasyBotLogic.perform_move(game.id)
        assert move is not None
        assert move.cell == 0
        assert move.subcell == 2 # EasyBot should defend and block opponent's win

    def test_medium_bot_valid_move(self, create_user):
        user = create_user()
        game = Game.objects.create(player_x=user, mode='bot_medium', status='active', current_turn='O')
        
        move = MediumBotLogic.perform_move(game.id)
        assert move is not None
        assert move.player == 'O'
        assert GameMove.objects.filter(game=game, player='O').count() == 1

    def test_hard_bot_valid_move(self, create_user):
        user = create_user()
        game = Game.objects.create(player_x=user, mode='bot_hard', status='active', current_turn='O')
        
        move = HardBotLogic.perform_move(game.id)
        assert move is not None
        assert move.player == 'O'
        assert GameMove.objects.filter(game=game, player='O').count() == 1

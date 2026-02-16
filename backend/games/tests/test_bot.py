import pytest
from games.models import Game, GameMove
from games.services.bot.easy import EasyBotLogic
from games.services.bot.medium import MediumBotLogic
from games.services.bot.hard import HardBotLogic

@pytest.mark.django_db
class TestBotLogic:
    def test_easy_bot_attack(self, create_user, game):
        # Scenario: O can win subboard 0 if it plays in subcell 2 (0, 1 already have O)
        # X starts (move 0). O moves (move 1). X moves (move 2). O moves (move 3). X moves (move 4). Next is O (move 5).
        # Total move_count must be odd for O's turn. 
        GameMove.objects.create(game=game, move_no=0, player='X', cell=4, subcell=4) # dummy
        GameMove.objects.create(game=game, move_no=1, player='O', cell=0, subcell=0)
        GameMove.objects.create(game=game, move_no=2, player='X', cell=8, subcell=8)
        GameMove.objects.create(game=game, move_no=3, player='O', cell=0, subcell=1)
        # Last move targets subboard 0
        GameMove.objects.create(game=game, move_no=4, player='X', cell=1, subcell=0)
        
        move = EasyBotLogic.perform_move(game.id)
        assert move is not None
        assert move.cell == 0
        assert move.subcell == 2 # EasyBot should attack and win the subboard

    def test_easy_bot_defense(self, create_user, game):
        # Scenario: X can win subboard 0 if it plays in subcell 2. O should block.
        # X:0, O:1, X:2, O:3, X:4. Next is O:5.
        GameMove.objects.create(game=game, move_no=0, player='X', cell=0, subcell=0) 
        GameMove.objects.create(game=game, move_no=1, player='O', cell=8, subcell=8)
        GameMove.objects.create(game=game, move_no=2, player='X', cell=0, subcell=1)
        GameMove.objects.create(game=game, move_no=3, player='O', cell=8, subcell=7)
        # Move 4 MUST target subboard 0 to constrain the bot to act there.
        # And it shouldn't overwrite 0 or 1.
        GameMove.objects.create(game=game, move_no=4, player='X', cell=4, subcell=0)
        
        move = EasyBotLogic.perform_move(game.id)
        assert move is not None
        assert move.cell == 0
        assert move.subcell == 2 # EasyBot should defend and block opponent's win

    def test_medium_bot_valid_move(self, create_user):
        user = create_user()
        game = Game.objects.create(player_x=user, mode='bot_medium', status='active')
        
        # Make it O's turn by adding 1 move
        GameMove.objects.create(game=game, move_no=0, player='X', cell=4, subcell=4)
        
        move = MediumBotLogic.perform_move(game.id)
        assert move is not None
        assert move.player == 'O'
        assert GameMove.objects.filter(game=game, player='O').count() == 1

    def test_hard_bot_valid_move(self, create_user):
        user = create_user()
        game = Game.objects.create(player_x=user, mode='bot_hard', status='active')
        
        # Make it O's turn
        GameMove.objects.create(game=game, move_no=0, player='X', cell=4, subcell=4)
        
        move = HardBotLogic.perform_move(game.id)
        assert move is not None
        assert move.player == 'O'
        assert GameMove.objects.filter(game=game, player='O').count() == 1

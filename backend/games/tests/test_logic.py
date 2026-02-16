import pytest
from games.logic import GameLogic
from games.models import Game, GameMove
from users.models import User

@pytest.mark.django_db
class TestGameLogicValidation:
    def test_valid_move(self, game):
        # X plays at (0,0)
        # Should not raise
        GameLogic.validate_move(game, 'X', 0, 0)

    def test_invalid_turn(self, game):
        # O tries to play when it's X's turn
        with pytest.raises(ValueError, match="Not your turn"):
            GameLogic.validate_move(game, 'O', 0, 0)

    def test_occupied_cell(self, game):
        # X plays at (0,0) (move 0)
        GameMove.objects.create(game=game, player='X', cell=0, subcell=0, move_no=0)
        
        # O tries to play there again (it is O's turn, so turn check passes)
        with pytest.raises(ValueError, match="Cell already occupied"):
            GameLogic.validate_move(game, 'O', 0, 0)

    def test_constraint_violation(self, game):
        # Constraint is set by the previous move. 
        # X moves first (move 0). Targets subcell 5.
        GameMove.objects.create(game=game, player='X', cell=0, subcell=5, move_no=0)

        # Now it is O's turn (move_count=1). O MUST play in subboard 5.
        # Try to play in subboard 0
        with pytest.raises(ValueError, match="Must play in subboard 5"):
            GameLogic.validate_move(game, 'O', 0, 0)

        # Play in subboard 5 (valid)
        GameLogic.validate_move(game, 'O', 5, 0)

@pytest.mark.django_db
class TestGameLogicWin:
    def test_subboard_row_win(self, game):
        # Simulate X winning subboard 0 (top row)
        # 0,0  0,1  0,2
        GameMove.objects.create(game=game, player='X', cell=0, subcell=0, move_no=1)
        GameMove.objects.create(game=game, player='X', cell=0, subcell=1, move_no=2)
        GameMove.objects.create(game=game, player='X', cell=0, subcell=2, move_no=3)

        winner = GameLogic.check_subboard_winner(game.id, 0)
        assert winner == 'X'

    def test_subboard_col_win(self, game):
        # Simulate O winning subboard 1 (left col)
        # 1,0
        # 1,3
        # 1,6
        GameMove.objects.create(game=game, player='O', cell=1, subcell=0, move_no=1)
        GameMove.objects.create(game=game, player='O', cell=1, subcell=3, move_no=2)
        GameMove.objects.create(game=game, player='O', cell=1, subcell=6, move_no=3)

        winner = GameLogic.check_subboard_winner(game.id, 1)
        assert winner == 'O'

    def test_global_winner(self, game):
        # Simulate X winning top row of GLOBAL board
        # Subboards 0, 1, 2 are won by X
        small_winners = [None] * 9
        small_winners[0] = 'X'
        small_winners[1] = 'X'
        small_winners[2] = 'X'

        winner = GameLogic.check_global_winner(small_winners)
        assert winner == 'X'

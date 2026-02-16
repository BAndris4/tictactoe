from .models import Game, GameMove

class GameLogic:
    @staticmethod
    def get_move_count(game_id):
        return GameMove.objects.filter(game_id=game_id).count()

    @staticmethod
    def get_current_turn(game_id):
        return 'O' if GameLogic.get_move_count(game_id) % 2 != 0 else 'X'

    @staticmethod
    def get_last_move(game_id):
        return GameMove.objects.filter(game_id=game_id).order_by('-move_no').first()

    @staticmethod
    def get_next_board_constraint(game_id):
        last_move = GameLogic.get_last_move(game_id)
        if not last_move:
            return None
        
        target_subboard = last_move.subcell
        winner = GameLogic.check_subboard_winner(game_id, target_subboard)
        if winner is not None: # Won or Draw
            return None
        return target_subboard

    @staticmethod
    def get_winner(game_id):
        small_winners = [GameLogic.check_subboard_winner(game_id, i) for i in range(9)]
        global_winner = GameLogic.check_global_winner(small_winners)
        if global_winner:
            return global_winner
        
        if GameLogic.check_global_draw(small_winners) or GameLogic.get_move_count(game_id) >= 81:
            return 'D'
        return None

    @staticmethod
    def get_cell_owner(game_id, cell, subcell):
        move = GameMove.objects.filter(game_id=game_id, cell=cell, subcell=subcell).first()
        return move.player if move else None

    @staticmethod
    def is_occupied(game_id, cell, subcell):
        return GameMove.objects.filter(game_id=game_id, cell=cell, subcell=subcell).exists()

    @staticmethod
    def is_subboard_full(game_id, cell):
        # A subboard has 9 cells. If all 9 are taken.
        count = GameMove.objects.filter(game_id=game_id, cell=cell).count()
        return count >= 9

    @staticmethod
    def validate_move(game, player_char, cell, subcell):
        # 1. Turn check
        if GameLogic.get_current_turn(game.id) != player_char:
            raise ValueError("Not your turn.")

        # 2. Game status check
        if game.status != 'active':
            # Allow moves if game is 'waiting' but 2 players are there? 
            # Or strict 'active' only. Let's assume 'active'.
            # If creating game makes it active immediately? No, wait for P2.
            pass
            # For now, let's just check if it's finished
        if GameLogic.get_winner(game.id):
             raise ValueError("Game already finished.")

        # 3. Constraint check (next_board_constraint)
        constraint = GameLogic.get_next_board_constraint(game.id)
        if constraint is not None:
            # Must play in this subboard
            # UNLESS that subboard is full? 
            # The constraint should theoretically be cleared if full.
            # But frontend logic says: 
            # if isFull(previousMove.cell) return true (anywhere)
            # if previousMove.cell == move.block return true
            
            # Since we store constraint, we expect it to be correct.
            # If constraint is set, we MUST play there.
            if cell != constraint:
                raise ValueError(f"Must play in subboard {constraint}")
        
        # 4. Occupancy check
        if GameLogic.is_occupied(game.id, cell, subcell):
             raise ValueError("Cell already occupied.")
             
        # 5. Global cell validity (0-8)
        if not (0 <= cell <= 8 and 0 <= subcell <= 8):
            raise ValueError("Invalid cell coordinates.")

    @staticmethod
    def check_line(values):
        # values is list of 3 chars or None
        if values[0] and values[0] == values[1] == values[2]:
            return values[0]
        return None

    @staticmethod
    def check_subboard_winner(game_id, cell):
        # Fetch moves for this cell
        moves = GameMove.objects.filter(game_id=game_id, cell=cell)
        grid = [None] * 9
        for m in moves:
            grid[m.subcell] = m.player
        
        # 1. Check for actual winner
        # Rows
        for i in range(0, 9, 3):
            w = GameLogic.check_line(grid[i:i+3])
            if w: return w
        # Cols
        for i in range(3):
            w = GameLogic.check_line([grid[i], grid[i+3], grid[i+6]])
            if w: return w
        # Diagonals
        w = GameLogic.check_line([grid[0], grid[4], grid[8]])
        if w: return w
        w = GameLogic.check_line([grid[2], grid[4], grid[6]])
        if w: return w
        
        # 2. Check for Draw / Dead Board
        # A board is dead if it's full (implied by above) OR if no one CAN win.
        if None not in grid:
            return 'D'
            
        # Check if X likely to win? Check if O likely to win?
        # If neither can complete a line, it is a draw.
        x_can_win = GameLogic.can_player_win(grid, 'X')
        o_can_win = GameLogic.can_player_win(grid, 'O')
        
        if not x_can_win and not o_can_win:
             return 'D'

        return None

    @staticmethod
    def can_player_win(grid, player):
        # Returns True if 'player' can potentially win this 3x3 grid
        # considering the current state.
        # A line is winnable if it doesn't contain the opponent's mark.
        opponent = 'O' if player == 'X' else 'X'
        
        lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ]
        
        for line in lines:
            # If any line has NO opponent marks, it's potentially winnable
            if not any(grid[i] == opponent for i in line):
                return True
        return False

    @staticmethod
    def check_global_winner(small_winners):
        # small_winners is list of 9 (X, O, D, or None)
        # Same logic as subboard
        grid = small_winners
        
        # Rows
        for i in range(0, 9, 3):
            w = GameLogic.check_line(grid[i:i+3])
            if w and w != 'D': return w
        # Cols
        for i in range(3):
            w = GameLogic.check_line([grid[i], grid[i+3], grid[i+6]])
            if w and w != 'D': return w
        # Diagonals
        w = GameLogic.check_line([grid[0], grid[4], grid[8]])
        if w and w != 'D': return w
        w = GameLogic.check_line([grid[2], grid[4], grid[6]])
        if w and w != 'D': return w
        return None

    @staticmethod
    def check_global_draw(small_winners):
        # Check if the GLOBAL board is dead (no one can win)
        # Treat 'D' as a blocker (like an opponent mark, but for BOTH players)
        
        # X can win if there is a line without 'O' AND without 'D' (unless D is somehow beneficial? No tictactoe rules say D is just dead space)
        # Actually, in Ultimate Tictactoe, a 'D' usually counts as nothing for winning, effectively a block for lines passing through it.
        
        x_can_win = False
        o_can_win = False
        
        lines = [
            [0,1,2],[3,4,5],[6,7,8],
            [0,3,6],[1,4,7],[2,5,8],
            [0,4,8],[2,4,6]
        ]
        
        # Check X
        for line in lines:
            # Winnable if line has no 'O' and no 'D'
             if not any(small_winners[i] in ['O', 'D'] for i in line):
                 x_can_win = True
                 break
        
        # Check O
        for line in lines:
             if not any(small_winners[i] in ['X', 'D'] for i in line):
                 o_can_win = True
                 break
                 
        return not x_can_win and not o_can_win

    @staticmethod
    def update_game_state(game, move):
        winner = GameLogic.get_winner(game.id)
        if winner:
            game.winner = winner
            game.status = 'finished'
            game.finished_at = move.created_at
        
        game.save()

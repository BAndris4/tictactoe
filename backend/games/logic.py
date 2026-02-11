from .models import Game, GameMove

class GameLogic:
    @staticmethod
    def get_cell_owner(game_id, cell, subcell):
        # We need to reconstruct the board state. 
        # For efficiency, we can fetch all moves.
        # Ideally, we would cache the board state, but for now we reconstruct.
        moves = GameMove.objects.filter(game_id=game_id)
        # 9x9 board representation
        # Mapping: cell (0-8) -> row/col of 3x3 block
        #          subcell (0-8) -> row/col within block
        
        # Or simpler: validation checks if spot is taken
        for m in moves:
            if m.cell == cell and m.subcell == subcell:
                return m.player
        return None

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
        if game.current_turn != player_char:
            raise ValueError("Not your turn.")

        # 2. Game status check
        if game.status != 'active':
            # Allow moves if game is 'waiting' but 2 players are there? 
            # Or strict 'active' only. Let's assume 'active'.
            # If creating game makes it active immediately? No, wait for P2.
            pass
            # For now, let's just check if it's finished
        if game.winner:
             raise ValueError("Game already finished.")

        # 3. Constraint check (next_board_constraint)
        if game.next_board_constraint is not None:
            # Must play in this subboard
            # UNLESS that subboard is full? 
            # The constraint should theoretically be cleared if full.
            # But frontend logic says: 
            # if isFull(previousMove.cell) return true (anywhere)
            # if previousMove.cell == move.block return true
            
            # Since we store constraint, we expect it to be correct.
            # If constraint is set, we MUST play there.
            if cell != game.next_board_constraint:
                raise ValueError(f"Must play in subboard {game.next_board_constraint}")
        
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
        # 1. Update subboard state (did someone win a subboard?)
        # We need to track small board winners. 
        # Models don't store small board winners explicitly?
        # The DBML didn't have a field for 'small_board_winners'. 
        # It had 'cache fields'. Maybe we should check dynamically or store it.
        # "Note: Event Sourcing model - Cache fields optimized"
        # Since we don't have a field, we calculate it on the fly every time?
        # Or maybe we rely on client? No, server must validate.
        # Let's calculate on fly.
        
        # Calculate all subboard winners to check global win
        # (Optimisation: Only check validity of the currently played subboard)
        # But for global win, we need all.
        
        small_winners = [None] * 9
        # Check JUST the cell we played in? 
        # Yes, previous moves couldn't have changed other boards.
        # But we need the ARRAY of small winners for global check.
        # So we iterate 0..8
        
        for i in range(9):
            small_winners[i] = GameLogic.check_subboard_winner(game.id, i)
        
        # 2. Check global winner
        # Note: check_subboard_winner now returns 'D' for draws.
        # check_global_winner handles 'D' by ignoring it (it's not X or O).
        
        game_winner = GameLogic.check_global_winner(small_winners)
        
        if game_winner:
            game.winner = game_winner
            game.status = 'finished'
            game.finished_at = move.created_at # approximate
        else:
            # Check for Global Draw
            # 1. Board physically full? (81 moves) - Fallback
            # 2. Or "Dead Board" (No one can win)
            
            is_global_draw = GameLogic.check_global_draw(small_winners)
            
            # Additional check: If board is full but check_global_draw didn't catch it for some reason?
            # check_global_draw logic (no lines possible) COVERS full board case (if full with no winner -> no lines possible)
            
            if is_global_draw or game.move_count + 1 >= 81:
                 game.winner = 'D'
                 game.status = 'finished'
                 game.finished_at = move.created_at

        # 3. Update constraint for NEXT player
        # The next player must play in 'move.subcell'
        target_subboard = move.subcell
        
        # If that subboard is full OR won OR draw, then constraint is NULL
        # small_winners[i] is 'X', 'O', or 'D'. All mean "closed".
        is_target_closed = small_winners[target_subboard] is not None
        
        # Note: We rely on small_winners, but just to be safe about race conditions or state:
        # check_subboard_winner calculates freshly.
        
        if is_target_closed:
             game.next_board_constraint = None
        else:
             game.next_board_constraint = target_subboard

        # 4. Turn & Stats
        game.current_turn = 'O' if game.current_turn == 'X' else 'X'
        game.move_count += 1
        game.last_move_at = move.created_at
        
        game.save()

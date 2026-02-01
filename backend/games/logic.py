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
        
        return None

    @staticmethod
    def check_global_winner(small_winners):
        # small_winners is list of 9 (X, O, or None)
        # Same logic as subboard
        grid = small_winners
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
        return None

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
        game_winner = GameLogic.check_global_winner(small_winners)
        if game_winner:
            game.winner = game_winner
            game.status = 'finished'
            game.finished_at = move.created_at # approximate
        elif game.move_count + 1 >= 81:
            # Board is full, and no global winner
            game.winner = 'D'
            game.status = 'finished'
            game.finished_at = move.created_at

        # 3. Update constraint for NEXT player
        # The next player must play in 'move.subcell'
        target_subboard = move.subcell
        
        # If that subboard is full OR won, then constraint is NULL (free choice)
        # New rule: If someone already won that subboard, you can play anywhere too.
        is_target_won = small_winners[target_subboard] is not None
        if is_target_won or GameLogic.is_subboard_full(game.id, target_subboard):
             game.next_board_constraint = None
        else:
             game.next_board_constraint = target_subboard

        # 4. Turn & Stats
        game.current_turn = 'O' if game.current_turn == 'X' else 'X'
        game.move_count += 1
        game.last_move_at = move.created_at
        
        game.save()

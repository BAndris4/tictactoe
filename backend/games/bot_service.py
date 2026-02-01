import random
from channels.db import database_sync_to_async
from .models import Game, GameMove
from .logic import GameLogic

class EasyBotLogic:
    @staticmethod
    def check_line_local(grid):
        # Rows
        for i in range(0, 9, 3):
            if grid[i] and grid[i] == grid[i+1] == grid[i+2]: return True
        # Cols
        for i in range(3):
            if grid[i] and grid[i] == grid[i+3] == grid[i+6]: return True
        # Diage
        if grid[0] and grid[0] == grid[4] == grid[8]: return True
        if grid[2] and grid[2] == grid[4] == grid[6]: return True
        return False

    @staticmethod
    def finalize_move(move):
        GameLogic.update_game_state(move.game, move)

    @staticmethod
    def calculate_move(game, bot_symbol):
        """
        Calculates move for Easy Bot.
        """
        # 1. Identify valid moves
        valid_moves = []
        target_subboard = game.next_board_constraint
        
        possible_boards = []
        if target_subboard is not None:
             target_won = GameLogic.check_subboard_winner(game.id, target_subboard) is not None
             target_full = GameLogic.is_subboard_full(game.id, target_subboard)
             if not target_won and not target_full:
                 possible_boards = [target_subboard]
             else:
                 # Constraint lifted because target is won or full
                 possible_boards = [i for i in range(9) if not GameLogic.is_subboard_full(game.id, i)]
        else:
             possible_boards = [i for i in range(9) if not GameLogic.is_subboard_full(game.id, i)]

        for board in possible_boards:
            for sub in range(9):
                if not GameLogic.is_occupied(game.id, board, sub):
                    valid_moves.append((board, sub))
        
        if not valid_moves:
            return None

        opponent_symbol = 'X' if bot_symbol == 'O' else 'O'

        # --- PRIORITY 1: ATTACK (Win subboard if possible) --- (NEW)
        for move in valid_moves:
            board, sub = move
            if EasyBotLogic.simulate_win(game.id, board, sub, bot_symbol):
                return move 

        # --- PRIORITY 2: DEFENSE ---
        for move in valid_moves:
            board, sub = move
            if EasyBotLogic.simulate_win(game.id, board, sub, opponent_symbol):
                return move 

        # --- PRIORITY 3: SAFE ---
        safe_moves = []
        for move in valid_moves:
            board, sub = move
            target_for_opponent = sub
            
            if GameLogic.is_subboard_full(game.id, target_for_opponent):
                 if EasyBotLogic.any_board_has_winning_move(game.id, opponent_symbol):
                     continue 
                 else:
                     safe_moves.append(move)
            else:
                if EasyBotLogic.board_has_winning_move(game.id, target_for_opponent, opponent_symbol):
                    continue
                safe_moves.append(move)
        
        if safe_moves:
            return random.choice(safe_moves)
        
        # --- PRIORITY 4: RANDOM ---
        return random.choice(valid_moves)

    @staticmethod
    def simulate_win(game_id, board, subcell_to_check, symbol):
        moves = GameMove.objects.filter(game_id=game_id, cell=board)
        grid = [None] * 9
        for m in moves:
            grid[m.subcell] = m.player
        
        if grid[subcell_to_check] is not None:
             return False
        grid[subcell_to_check] = symbol
        
        return EasyBotLogic.check_line_local(grid)

    @staticmethod
    def board_has_winning_move(game_id, board, symbol):
        moves = GameMove.objects.filter(game_id=game_id, cell=board)
        grid = [None] * 9
        for m in moves:
            grid[m.subcell] = m.player
        
        open_spots = [i for i in range(9) if grid[i] is None]
        for spot in open_spots:
            grid[spot] = symbol
            if EasyBotLogic.check_line_local(grid):
                return True
            grid[spot] = None
        return False

    @staticmethod
    def any_board_has_winning_move(game_id, symbol):
        for b in range(9):
             if not GameLogic.is_subboard_full(game_id, b):
                 if EasyBotLogic.board_has_winning_move(game_id, b, symbol):
                     return True
        return False
        
    @staticmethod
    def perform_move(game_id):
        game = Game.objects.get(id=game_id)
        bot_symbol = 'X' if game.player_x is None else 'O'
        
        if game.current_turn != bot_symbol:
            return None

        move_coords = EasyBotLogic.calculate_move(game, bot_symbol)
        if not move_coords:
            return None
            
        cell, subcell = move_coords
        
        move = GameMove.objects.create(
            game=game,
            move_no=game.move_count + 1,
            player=bot_symbol,
            cell=cell,
            subcell=subcell
        )
        
        return move

class MediumBotLogic:
    @staticmethod
    def calculate_move(game, bot_symbol):
        # 1. Reconstruct board state for efficiency
        # We need a 9x9 grid representation.
        moves = GameMove.objects.filter(game_id=game.id)
        board = [None] * 81 # 0-80 flattened
        
        small_board_winners = [None] * 9
        
        for m in moves:
            idx = m.cell * 9 + m.subcell
            board[idx] = m.player
            
        # Recalculate small winners locally
        for i in range(9):
             sub_grid = board[i*9 : (i+1)*9]
             small_board_winners[i] = MediumBotLogic.check_line_local_array(sub_grid)

        return MediumBotLogic.minimax_root(game, bot_symbol, board, small_board_winners)

    @staticmethod
    def check_line_local_array(sub_grid):
        # Rows
        for i in range(0, 9, 3):
            if sub_grid[i] and sub_grid[i] == sub_grid[i+1] == sub_grid[i+2]: return sub_grid[i]
        # Cols
        for i in range(3):
            if sub_grid[i] and sub_grid[i] == sub_grid[i+3] == sub_grid[i+6]: return sub_grid[i]
        # Diag
        if sub_grid[0] and sub_grid[0] == sub_grid[4] == sub_grid[8]: return sub_grid[0]
        if sub_grid[2] and sub_grid[2] == sub_grid[4] == sub_grid[6]: return sub_grid[2]
        return None

    @staticmethod
    def get_valid_moves(board, small_board_winners, constraint):
        valid_moves = []
        possible_boards = []
        
        # Rule: Both 'Full' and 'Won' boards release constraint.
        if constraint is not None:
             is_full = all(board[constraint*9 + i] is not None for i in range(9))
             is_won = small_board_winners[constraint] is not None
             if not is_full and not is_won:
                 possible_boards = [constraint]
             else:
                 # Constraint is FULL or WON, so free move
                 # Valid boards are those that are NOT full.
                 possible_boards = [i for i in range(9) if not all(board[i*9+k] is not None for k in range(9))]
        else:
             possible_boards = [i for i in range(9) if not all(board[i*9+k] is not None for k in range(9))]

        for b in possible_boards:
            for s in range(9):
                if board[b*9 + s] is None:
                    valid_moves.append((b, s))
        return valid_moves

    @staticmethod
    def minimax_root(game, bot_symbol, board, small_board_winners):
        opponent_symbol = 'X' if bot_symbol == 'O' else 'O'
        constraint = game.next_board_constraint
        
        valid_moves = MediumBotLogic.get_valid_moves(board, small_board_winners, constraint)
        
        if not valid_moves:
            return None

        best_score = -float('inf')
        best_move = random.choice(valid_moves) # Fallback
        
        # Dynamic Depth
        current_depth = 4 
        if len(valid_moves) > 10: current_depth = 3
        if len(valid_moves) > 30: current_depth = 2
        
        alpha = -float('inf')
        beta = float('inf')

        for move in valid_moves:
            b, s = move
            idx = b*9 + s
            board[idx] = bot_symbol
            
            was_winner = small_board_winners[b]
            sub_grid = board[b*9 : (b+1)*9]
            new_winner = MediumBotLogic.check_line_local_array(sub_grid)
            small_board_winners[b] = new_winner
            
            next_constraint = s
            if small_board_winners[s] is not None or all(board[s*9+k] is not None for k in range(9)):
                next_constraint = None
            
            score = MediumBotLogic.minimax(board, small_board_winners, next_constraint, current_depth - 1, False, alpha, beta, bot_symbol, opponent_symbol)
            
            board[idx] = None
            small_board_winners[b] = was_winner
            
            if score > best_score:
                best_score = score
                best_move = move
            
            alpha = max(alpha, score)
            if beta <= alpha: break
        
        return best_move

    @staticmethod
    def minimax(board, small_board_winners, constraint, depth, is_maximizing, alpha, beta, bot_symbol, opponent_symbol):
        global_winner = MediumBotLogic.check_line_local_array(small_board_winners)
        if global_winner == bot_symbol: return 10000 + depth
        if global_winner == opponent_symbol: return -10000 - depth
        
        if depth == 0:
            return MediumBotLogic.evaluate(board, small_board_winners, bot_symbol, opponent_symbol)

        valid_moves = MediumBotLogic.get_valid_moves(board, small_board_winners, constraint)
        if not valid_moves:
            return 0 

        if is_maximizing:
            max_eval = -float('inf')
            for move in valid_moves:
                b, s = move
                idx = b*9 + s
                board[idx] = bot_symbol
                was_winner = small_board_winners[b]
                small_board_winners[b] = MediumBotLogic.check_line_local_array(board[b*9 : (b+1)*9])
                
                next_constraint = s
                if small_board_winners[s] is not None or all(board[s*9+k] is not None for k in range(9)):
                    next_constraint = None

                eval = MediumBotLogic.minimax(board, small_board_winners, next_constraint, depth - 1, False, alpha, beta, bot_symbol, opponent_symbol)
                
                board[idx] = None
                small_board_winners[b] = was_winner
                
                max_eval = max(max_eval, eval)
                alpha = max(alpha, eval)
                if beta <= alpha: break
            return max_eval
        else:
            min_eval = float('inf')
            for move in valid_moves:
                b, s = move
                idx = b*9 + s
                board[idx] = opponent_symbol
                was_winner = small_board_winners[b]
                small_board_winners[b] = MediumBotLogic.check_line_local_array(board[b*9 : (b+1)*9])
                
                next_constraint = s
                if small_board_winners[s] is not None or all(board[s*9+k] is not None for k in range(9)):
                    next_constraint = None

                eval = MediumBotLogic.minimax(board, small_board_winners, next_constraint, depth - 1, True, alpha, beta, bot_symbol, opponent_symbol)
                
                board[idx] = None
                small_board_winners[b] = was_winner
                
                min_eval = min(min_eval, eval)
                beta = min(beta, eval)
                if beta <= alpha: break
            return min_eval

    @staticmethod
    def evaluate(board, small_board_winners, bot_symbol, opponent_symbol):
        score = 0
        
        # 1. Global Board Evaluation
        for i in range(9):
            w = small_board_winners[i]
            if w == bot_symbol: score += 100
            elif w == opponent_symbol: score -= 100
            
            # Center Small Board
            if i == 4:
                if w == bot_symbol: score += 50
                elif w == opponent_symbol: score -= 50
        
        score += MediumBotLogic.evaluate_lines(small_board_winners, bot_symbol, opponent_symbol, 200, 0)

        # 2. Local Board Evaluation
        for i in range(9):
            if small_board_winners[i] is not None: continue
            
            sub_grid = board[i*9 : (i+1)*9]
            if sub_grid[4] == bot_symbol: score += 5
            elif sub_grid[4] == opponent_symbol: score -= 5
            
            score += MediumBotLogic.evaluate_lines(sub_grid, bot_symbol, opponent_symbol, 10, 1)
        
        return score

    @staticmethod
    def evaluate_lines(grid, bot, opp, score_2, score_1):
        s = 0
        lines = [
            [0,1,2],[3,4,5],[6,7,8], # Rows
            [0,3,6],[1,4,7],[2,5,8], # Cols
            [0,4,8],[2,4,6] # Diags
        ]
        
        for line in lines:
            vals = [grid[x] for x in line]
            bot_cnt = vals.count(bot)
            opp_cnt = vals.count(opp)
            none_cnt = vals.count(None)
            
            if bot_cnt == 2 and none_cnt == 1: s += score_2
            elif bot_cnt == 1 and none_cnt == 2: s += score_1
            
            if opp_cnt == 2 and none_cnt == 1: s -= score_2
            elif opp_cnt == 1 and none_cnt == 2: s -= score_1
        return s
    
    @staticmethod
    def perform_move(game_id):
        game = Game.objects.get(id=game_id)
        bot_symbol = 'X' if game.player_x is None else 'O'
        
        if game.current_turn != bot_symbol: return None

        move_coords = MediumBotLogic.calculate_move(game, bot_symbol)
        if not move_coords: return None # Fallback logic needed?
            
        cell, subcell = move_coords
        
        move = GameMove.objects.create(
            game=game,
            move_no=game.move_count + 1,
            player=bot_symbol,
            cell=cell,
            subcell=subcell
        )
        return move

class BotService:
    @staticmethod
    async def process_bot_move(game_id, channel_layer, group_name):
        import asyncio
        await asyncio.sleep(1) 
        
        # Determine strict mode
        game = await database_sync_to_async(Game.objects.get)(id=game_id)
        
        move = None
        if game.mode == 'bot_medium':
             move = await database_sync_to_async(MediumBotLogic.perform_move)(game_id)
        else:
             move = await database_sync_to_async(EasyBotLogic.perform_move)(game_id)
        
        if move:
            await database_sync_to_async(EasyBotLogic.finalize_move)(move)
            
            await channel_layer.group_send(
                group_name,
                {
                    'type': 'game_update',
                    'data': {
                        'type': 'new_move',
                        'move': {
                            'player': move.player,
                            'cell': move.cell,
                            'subcell': move.subcell,
                            'move_no': move.move_no,
                            'created_at': move.created_at.isoformat()
                        },
                    }
                }
            )
            
            await BotService.check_game_over_broadcast(game_id, channel_layer, group_name)

    @staticmethod
    async def check_game_over_broadcast(game_id, channel_layer, group_name):
         game = await database_sync_to_async(Game.objects.get)(id=game_id)
         if game.status == 'finished':
            await channel_layer.group_send(
                group_name,
                {
                     'type': 'game_update',
                     'data': {
                        'type': 'game_over',
                        'mode': game.mode,
                        'winner': game.winner,
                        'reason': 'regular'
                    }
                }
            )

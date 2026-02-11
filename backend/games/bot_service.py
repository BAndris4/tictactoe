import random
from channels.db import database_sync_to_async
from .models import Game, GameMove, ChatMessage
from .logic import GameLogic
from .bot_config import BOT_CONFIGS

class BotChatService:
    @staticmethod
    async def maybe_send_chat(game, bot_symbol, trigger, channel_layer, group_name):
        # 1. Check chance (e.g. 30% for moves, 100% for GG/Greeting)
        chance = 30
        if trigger in ['greeting', 'gg_win', 'gg_loss']:
            chance = 100
            
        if random.randint(1, 100) > chance:
            return

        # 2. Get Config
        config = BOT_CONFIGS.get(game.mode)
        if not config: return

        phrases = config.get('chat_phrases', {}).get(trigger, [])
        if not phrases: return

        content = random.choice(phrases)
        
        # 3. Save to DB
        from .models import ChatMessage
        # Wait, ChatMessage is in .models now.
        
        # We need user for sender... Bot doesn't have a user ID usually???
        # Actually, standard is sender=None for system/bot, but we use sender_name
        
        # Sender ID? If bot is linked to a user (unlikely for these simple bots), use it.
        # But our models say sender can be null.
        
        sender_id = None
        # Try to find if there is a bot user? No, simplify.
        
        sender_name = config['name']
        
        msg = await database_sync_to_async(ChatMessage.objects.create)(
            game=game,
            sender=None,
            sender_name=sender_name,
            content=content,
            is_bot=True
        )

        # 4. Broadcast
        await channel_layer.group_send(
            group_name,
            {
                'type': 'chat_message',
                'message': {
                    'id': msg.id,
                    'sender': 'Bot', # Special flag for frontend? Or just null?
                    'sender_name': sender_name,
                    'content': content,
                    'is_bot': True,
                    'timestamp': msg.timestamp.isoformat()
                }
            }
        )


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
                 possible_boards = [i for i in range(9) if not GameLogic.is_subboard_full(game.id, i) and GameLogic.check_subboard_winner(game.id, i) is None]
        else:
             possible_boards = [i for i in range(9) if not GameLogic.is_subboard_full(game.id, i) and GameLogic.check_subboard_winner(game.id, i) is None]

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

class HardBotLogic:
    # "Pre-trained" weights for the evaluation policy
    WEIGHTS = {
        'subboard_win': 1000,
        'center_subboard': 3.5,
        'corner_subboard': 1.8,
        'edge_subboard': 1.2,
        'two_in_line': 150,
        'one_in_line': 25,
        'block_opponent': 180,
        'center_cell': 15,
        'corner_cell': 8,
        'edge_cell': 4
    }

    @staticmethod
    def check_line_local_array(sub_grid):
        for i in range(0, 9, 3):
            if sub_grid[i] and sub_grid[i] == sub_grid[i+1] == sub_grid[i+2]: return sub_grid[i]
        for i in range(3):
            if sub_grid[i] and sub_grid[i] == sub_grid[i+3] == sub_grid[i+6]: return sub_grid[i]
        if sub_grid[0] and sub_grid[0] == sub_grid[4] == sub_grid[8]: return sub_grid[0]
        if sub_grid[2] and sub_grid[2] == sub_grid[4] == sub_grid[6]: return sub_grid[2]
        return None

    @staticmethod
    def get_valid_moves(board, winners, constraint):
        if constraint is not None:
             is_full = all(board[constraint*9 + i] is not None for i in range(9))
             is_won = winners[constraint] is not None
             if not is_full and not is_won:
                 return [(constraint, s) for s in range(9) if board[constraint*9 + s] is None]
        
        moves = []
        for b in range(9):
             if winners[b] is None and not all(board[b*9+k] is not None for k in range(9)):
                 for s in range(9):
                     if board[b*9 + s] is None:
                         moves.append((b, s))
        return moves

    @staticmethod
    def evaluate(board, winners, bot, opp):
        score = 0
        w = HardBotLogic.WEIGHTS
        
        # Macro Evaluation
        macro_weights = [w['corner_subboard'], w['edge_subboard'], w['corner_subboard'],
                         w['edge_subboard'], w['center_subboard'], w['edge_subboard'],
                         w['corner_subboard'], w['edge_subboard'], w['corner_subboard']]
        
        for i in range(9):
            if winners[i] == bot: score += w['subboard_win'] * macro_weights[i]
            elif winners[i] == opp: score -= w['subboard_win'] * macro_weights[i]
        
        score += HardBotLogic.eval_lines(winners, bot, opp, w['two_in_line'], w['one_in_line'])

        # Micro Evaluation
        cell_weights = [w['corner_cell'], w['edge_cell'], w['corner_cell'],
                        w['edge_cell'], w['center_cell'], w['edge_cell'],
                        w['corner_cell'], w['edge_cell'], w['corner_cell']]
        
        for i in range(9):
            if winners[i] is not None: continue
            sub = board[i*9 : (i+1)*9]
            for c in range(9):
                if sub[c] == bot: score += cell_weights[c]
                elif sub[c] == opp: score -= cell_weights[c]
            score += HardBotLogic.eval_lines(sub, bot, opp, w['two_in_line'] // 5, w['one_in_line'] // 5)
            
        return score

    @staticmethod
    def eval_lines(grid, bot, opp, s2, s1):
        s = 0
        lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]
        for line in lines:
            vals = [grid[x] for x in line]
            b_cnt, o_cnt = vals.count(bot), vals.count(opp)
            if o_cnt == 0:
                if b_cnt == 2: s += s2
                elif b_cnt == 1: s += s1
            if b_cnt == 0:
                if o_cnt == 2: s -= s2
                elif o_cnt == 1: s -= s1
        return s

    @staticmethod
    def minimax(board, winners, constraint, depth, is_max, alpha, beta, bot, opp):
        win = HardBotLogic.check_line_local_array(winners)
        if win == bot: return 100000 + depth
        if win == opp: return -100000 - depth
        if depth == 0: return HardBotLogic.evaluate(board, winners, bot, opp)
        
        moves = HardBotLogic.get_valid_moves(board, winners, constraint)
        if not moves: return 0
        
        # Move Ordering: center/corner/threats
        moves.sort(key=lambda m: (0 if m[1]==4 else 1, 0 if m[0]==4 else 1))

        if is_max:
            val = -float('inf')
            for b, s in moves:
                board[b*9+s] = bot
                was = winners[b]
                winners[b] = HardBotLogic.check_line_local_array(board[b*9 : (b+1)*9])
                nc = s if winners[s] is None and not all(board[s*9+k] is not None for k in range(9)) else None
                val = max(val, HardBotLogic.minimax(board, winners, nc, depth-1, False, alpha, beta, bot, opp))
                board[b*9+s] = None
                winners[b] = was
                alpha = max(alpha, val)
                if beta <= alpha: break
            return val
        else:
            val = float('inf')
            for b, s in moves:
                board[b*9+s] = opp
                was = winners[b]
                winners[b] = HardBotLogic.check_line_local_array(board[b*9 : (b+1)*9])
                nc = s if winners[s] is None and not all(board[s*9+k] is not None for k in range(9)) else None
                val = min(val, HardBotLogic.minimax(board, winners, nc, depth-1, True, alpha, beta, bot, opp))
                board[b*9+s] = None
                winners[b] = was
                beta = min(beta, val)
                if beta <= alpha: break
            return val

    @staticmethod
    def perform_move(game_id, difficulty=0):
        game = Game.objects.get(id=game_id)
        bot_symbol = 'X' if game.player_x is None else 'O'
        opp_symbol = 'O' if bot_symbol == 'X' else 'X'
        
        if game.current_turn != bot_symbol:
            print(f"[HardBot] Not my turn! Current: {game.current_turn}, Me: {bot_symbol}")
            return None

        moves_qs = GameMove.objects.filter(game_id=game.id)
        board = [None]*81
        winners = [None]*9
        for m in moves_qs: board[m.cell*9+m.subcell] = m.player
        for i in range(9): winners[i] = HardBotLogic.check_line_local_array(board[i*9:(i+1)*9])

        valid = HardBotLogic.get_valid_moves(board, winners, game.next_board_constraint)
        if not valid:
            print("[HardBot] No valid moves found!")
            return None
        
        # RANDOMNESS LOGIC:
        # difficulty is 0-100 (probability of random move).
        if difficulty > 0 and random.randint(1, 100) <= difficulty:
            print(f"[Bot] Difficulty {difficulty}%: Dropping perfect play for randomness!")
            best_move = random.choice(valid)
            return GameMove.objects.create(game=game, move_no=game.move_count+1, player=bot_symbol, cell=best_move[0], subcell=best_move[1])

        print(f"[HardBot] Thinking... (Valid moves: {len(valid)})")
        
        # Iterative Deepening to depth 5 (safe for Python performance)
        best_move = valid[0]
        for depth in range(1, 6):
            best_val = -float('inf')
            alpha, beta = -float('inf'), float('inf')
            for b, s in valid:
                board[b*9+s] = bot_symbol
                was = winners[b]
                winners[b] = HardBotLogic.check_line_local_array(board[b*9 : (b+1)*9])
                nc = s if winners[s] is None and not all(board[s*9+k] is not None for k in range(9)) else None
                val = HardBotLogic.minimax(board, winners, nc, depth-1, False, alpha, beta, bot_symbol, opp_symbol)
                board[b*9+s] = None
                winners[b] = was
                if val > best_val:
                    best_val, best_move = val, (b, s)
                alpha = max(alpha, best_val)
        
        return GameMove.objects.create(game=game, move_no=game.move_count+1, player=bot_symbol, cell=best_move[0], subcell=best_move[1])

class BotService:
    @staticmethod
    async def process_bot_move(game_id, channel_layer, group_name):
        import asyncio
        await asyncio.sleep(1) 
        
        # Determine strict mode
        game = await database_sync_to_async(Game.objects.get)(id=game_id)
        
        if game.status != 'active':
            return

        # Check if it's actually bot's turn
        # Avoid accessing Foreign Keys (player_x) directly as it triggers sync DB queries
        is_bot_x = game.player_x_id is None
        is_bot_o = game.player_o_id is None
        
        is_bot_turn = (game.current_turn == 'X' and is_bot_x) or (game.current_turn == 'O' and is_bot_o)
        
        if not is_bot_turn:
            return

        # --- BOT CHAT AGENT (Greeting & Chatter) ---
        bot_symbol = game.current_turn
        if game.move_count <= 1:
             await BotChatService.maybe_send_chat(game, bot_symbol, 'greeting', channel_layer, group_name)
        # else:
        #      # Comment on previous move?
        #      # For now just random chatter during turn
        #      await BotChatService.maybe_send_chat(game, bot_symbol, 'good_move', channel_layer, group_name)
        # -------------------------------------------
        
        # --- REACTION TO OPPONENT MOVE ---
        # Did the opponent just win a subgrid?
        # We can check the board corresponding to the previous move.
        # But we don't easily know which move was last without query.
        last_move = await database_sync_to_async(GameMove.objects.filter(game=game).last)()
        if last_move and last_move.player != bot_symbol:
            # Opponent just moved. Did they win that subboard?
            w = await database_sync_to_async(GameLogic.check_subboard_winner)(game_id, last_move.cell)
            if w and w == last_move.player:
                 # Opponent won a subgrid
                 await BotChatService.maybe_send_chat(game, bot_symbol, 'subgrid_loss', channel_layer, group_name)
        # -------------------------------------------

        # Ensure we are in a bot mode
        bot_modes = ['bot_easy', 'bot_medium', 'bot_hard', 'bot_custom']
        if game.mode not in bot_modes:
            return

        move = None
        if game.mode == 'bot_hard' or game.mode == 'bot_custom':
             move = await database_sync_to_async(HardBotLogic.perform_move)(game_id, difficulty=game.bot_difficulty)
        elif game.mode == 'bot_medium':
             move = await database_sync_to_async(MediumBotLogic.perform_move)(game_id)
        elif game.mode == 'bot_easy':
             move = await database_sync_to_async(EasyBotLogic.perform_move)(game_id)
        
        if move:
            # Capture state BEFORE finalizing move (which updates DB)
            # Actually, finalize_move updates the DB. We need to check what changed.
            # Easiest way: Check the subcell's winner status AFTER the move.
            
            # But we need to know if it JUST happened. 
            # We can check if the subgrid was already won before.
            # But 'game' object is from before the move.
            
            prev_winners = {}
            # We need to calculate small board winners from the current moves
            # This is expensive.
            # Alternative: GameLogic returns info? No.
            
            # Let's trust the 'game' object acts as snapshot BEFORE move.
            # But we need to parse its state? 'game' model doesn't store small winners easily (cache is complex).
            
            # OPTIMIZATION: Just check the specific board the move was played on.
            # If that board is now won, and wasn't won before.
            
            # 1. Get status of the board where move happened (move.cell) BEFORE move.
            # We need to query moves to see if it was won.
            
            # Actually, let's keep it simple.
            # We will finalize the move. Then check if the board (move.cell) is now won by bot or opponent.
            # If it is won, and we assume it wasn't won before (otherwise we couldn't play there... unless free move mode which we don't support fully yet).
            # Wait, if board is won, you can't play there usually.
            # EXCEPT if we just closed it.
            
            await database_sync_to_async(EasyBotLogic.finalize_move)(move)
            
            # 2. Check if the specific subboard (move.cell) is now won
            # We need to re-fetch or calculate.
            # Let's use GameLogic to check the specific subboard status
            winner_of_subboard = await database_sync_to_async(GameLogic.check_subboard_winner)(game_id, move.cell)
            
            if winner_of_subboard:
                if winner_of_subboard == move.player:
                    # Bot won the subgrid
                    await BotChatService.maybe_send_chat(game, move.player, 'subgrid_win', channel_layer, group_name)
                elif winner_of_subboard == ('X' if move.player == 'O' else 'O'):
                     # Bot lost the subgrid (played into a loss? unlikely for bot to play into loss unless forced)
                     # Or maybe the opponent won it previously?
                     # If I play in a board, I can only WIN it for myself. I cannot make the opponent win it by my move.
                     pass
            
            # 3. Check if we just GAVE the opponent a free subboard or advantage? 
            # Too complex. Let's stick to "I won a subgrid".
            
            # What about "I lost a subgrid"? 
            # That happens when the OPPONENT plays.
            # We are in 'process_bot_move'. We are the bot.
            # So we only react to OUR moves here.
            
            # To react to OPPONENT moves (e.g. "Oh no, you won a grid"), 
            # we need to check the board state at the START of process_bot_move (which is right after opponent played).
            
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
            
            # Check for win to say GG
            # We can check game state after finalize_move (which calls update_game_state)
            # But game object here is stale? 
            # finalize_move updates the DB object.
            
            # Reload game to check winner
            # game.refresh_from_db() # Sync - REMOVED to fix Async error
            
            # Wait, we are in async.
            updated_game = await database_sync_to_async(Game.objects.get)(id=game_id)

            if updated_game.status == 'finished':
                if updated_game.winner == 'D':
                     await BotChatService.maybe_send_chat(updated_game, move.player, 'draw', channel_layer, group_name)
                elif updated_game.winner == move.player:
                     await BotChatService.maybe_send_chat(updated_game, move.player, 'gg_win', channel_layer, group_name)
                else:
                     await BotChatService.maybe_send_chat(updated_game, move.player, 'gg_loss', channel_layer, group_name)

            await BotService.check_game_over_broadcast(game_id, channel_layer, group_name)

    @staticmethod
    async def check_game_over_broadcast(game_id, channel_layer, group_name):
         from .broadcast_service import BroadcastService
         await BroadcastService.broadcast_game_over(game_id)


class EvaluationService:
    @staticmethod
    @staticmethod
    def to_notation(cell, subcell):
        # Global Row/Col
        # cell is 0-8. 0,1,2 is top row. 
        # subcell is 0-8.
        
        # cell_row = cell // 3
        # cell_col = cell % 3
        # sub_row = subcell // 3
        # sub_col = subcell % 3
        
        global_row = (cell // 3) * 3 + (subcell // 3)
        global_col = (cell % 3) * 3 + (subcell % 3)
        
        # Notation: a-i for cols, 1-9 for rows (Top 1 to Bottom 9)
        col_char = chr(ord('a') + global_col)
        row_char = str(global_row + 1)
        
        return f"{col_char}{row_char}"

    @staticmethod
    def calculate_game_analysis(game_id):
        # Synchronous method to be called by View
        # 1. Fetch Game and Moves
        game = Game.objects.get(id=game_id)
        all_moves = list(GameMove.objects.filter(game=game).order_by('move_no'))
        
        analysis_results = []
        
        board = [None] * 81
        winners = [None] * 9
        
        # We need to replay the game to build state at each step
        for i, move in enumerate(all_moves):
            # State BEFORE this move is what we evaluate for "Best Move Opportunity"
            
            # Constraint:
            # We need to determine constraint based on previous move
            constraint = None
            if i > 0:
                prev = all_moves[i-1]
                target = prev.subcell
                if winners[target] is not None or all(board[target*9+k] is not None for k in range(9)):
                    constraint = None
                else:
                    constraint = target

            # Calculate Best Move from this position
            is_x = (move.player == 'X')
            
            best_val = -float('inf') if is_x else float('inf')
            second_best_val = -float('inf') if is_x else float('inf') # For brilliance check
            
            best_move_coords = None
            
            valid_moves = HardBotLogic.get_valid_moves(board, winners, constraint)
            
            # Optimization: If only 1 move, it's best.
            if len(valid_moves) == 1:
                best_val = 0 # Irrelevant
                classification = "forced"
                feedback = "Forced move."
                diff = 0
                best_move_coords = valid_moves[0]
                actual_move_score = 0
                refutation_notation = None
            else:
                 # Run Minimax
                 # Sort for pruning
                 valid_moves.sort(key=lambda m: (0 if m[1]==4 else 1, 0 if m[0]==4 else 1))
                 
                 alpha = -float('inf')
                 beta = float('inf')
                 
                 actual_move_score = None
                 
                 # Store moves and scores to find second best
                 move_scores = []
                 
                 for b, s in valid_moves:
                    is_actual_move = (b == move.cell and s == move.subcell)
                    
                    board[b*9+s] = move.player
                    was = winners[b]
                    winners[b] = HardBotLogic.check_line_local_array(board[b*9 : (b+1)*9])
                    
                    nc = s if winners[s] is None and not all(board[s*9+k] is not None for k in range(9)) else None
                    
                    # Depth 2 for speed? 3 is better quality.
                    val = HardBotLogic.minimax(board, winners, nc, depth=2, is_max=not is_x, alpha=alpha, beta=beta, bot='X', opp='O')
                    
                    board[b*9+s] = None
                    winners[b] = was
                    
                    move_scores.append(val)

                    if is_actual_move:
                        actual_move_score = val
                    
                    if is_x:
                        if val > best_val:
                             second_best_val = best_val
                             best_val = val
                             best_move_coords = (b, s)
                        elif val > second_best_val:
                             second_best_val = val
                             
                        alpha = max(alpha, best_val)
                    else:
                        if val < best_val:
                             second_best_val = best_val
                             best_val = val
                             best_move_coords = (b, s)
                        elif val < second_best_val:
                             second_best_val = val

                        beta = min(beta, best_val)
                 
                 if actual_move_score is None: actual_move_score = best_val # Should not happen

                 # Diff
                 diff = 0
                 if is_x: diff = best_val - actual_move_score
                 else: diff = actual_move_score - best_val
                 
                 # Classification
                 classification = "neutral"
                 feedback = ""
                 refutation_notation = None
                 
                 # Thresholds
                 # Win range is usually +/- 1000ish or high hundreds if winning logic kicks in.
                 # Brilliant: Best move (diff 0) AND significantly better than 2nd best.
                 # Example: Best is +500 (Win), 2nd best is -500 (Loss). That's brilliant.
                 # Or Best is +200, 2nd is -50.
                 
                 is_brilliant = False
                 if diff == 0:
                     margin = 0
                     if is_x: margin = best_val - second_best_val
                     else: margin = second_best_val - best_val
                     
                     # A margin of > 150 implies significant difference in outcome/position
                     if margin > 150: 
                        is_brilliant = True
                 
                 best_notation = EvaluationService.to_notation(best_move_coords[0], best_move_coords[1])
                 
                 if is_brilliant:
                    classification = "brilliant"
                    feedback = "Brilliant move!"
                 elif diff <= 0: 
                    classification = "best"
                    feedback = "Best move."
                 elif diff < 50:
                    classification = "good"
                    feedback = "Good move."
                 elif diff < 200:
                    classification = "inaccuracy"
                    feedback = f"Best move was {best_notation}"
                 elif diff < 1000:
                    classification = "mistake"
                    feedback = f"Best move was {best_notation}"
                 else:
                    classification = "blunder"
                    feedback = f"Best move was {best_notation}"

                 # REFUTATION (For Mistake/Blunder)
                 # Simulate the opponent's reply to the ACTUAL move to show why it's bad.
                 if classification in ['mistake', 'blunder']:
                     # Apply ACTUAL move
                     board[move.cell*9 + move.subcell] = move.player
                     was_w = winners[move.cell]
                     winners[move.cell] = HardBotLogic.check_line_local_array(board[move.cell*9 : (move.cell+1)*9])
                     next_constraint = move.subcell if winners[move.subcell] is None and not all(board[move.subcell*9+k] is not None for k in range(9)) else None
                     
                     # Find Opponent's Best Move
                     opp_moves = HardBotLogic.get_valid_moves(board, winners, next_constraint)
                     if opp_moves:
                         opp_val = -float('inf') if not is_x else float('inf') # Opponent wants to min/max opposite
                         opp_best = None
                         
                         for ob, os in opp_moves:
                             board[ob*9+os] = 'O' if is_x else 'X'
                             ww = winners[ob]
                             winners[ob] = HardBotLogic.check_line_local_array(board[ob*9 : (ob+1)*9])
                             # leaf eval
                             current_val = HardBotLogic.evaluate(board, winners, 'X', 'O') 
                             # (We can use simple eval here or depth 1)
                             
                             board[ob*9+os] = None
                             winners[ob] = ww
                             
                             if not is_x: 
                                 # Player was O (is_x False). Opponent is X (Maximizer).
                                 # opp_val started at -inf.
                                 if current_val > opp_val:
                                     opp_val = current_val
                                     opp_best = (ob, os)
                             else: 
                                 # Player was X (is_x True). Opponent is O (Minimizer).
                                 # opp_val started at inf.
                                 if current_val < opp_val:
                                     opp_val = current_val
                                     opp_best = (ob, os)
                         
                         if opp_best:
                             ref_not = EvaluationService.to_notation(opp_best[0], opp_best[1])
                             refutation_notation = ref_not
                             
                             # Explain WHY
                             # Check what this move achieved
                             # We need to re-simulate the best move to check its effect
                             ob, os = opp_best
                             board[ob*9+os] = 'O' if is_x else 'X'
                             ww = winners[ob]
                             winners[ob] = HardBotLogic.check_line_local_array(board[ob*9 : (ob+1)*9])
                             
                             global_win = HardBotLogic.check_line_local_array(winners)
                             sub_win = winners[ob]
                             
                             # Restore
                             board[ob*9+os] = None
                             winners[ob] = ww
                             
                             reason = ""
                             if global_win:
                                 reason = "allows forced win"
                             elif sub_win:
                                 # Identify which subboard was won
                                 # It's 'ob'. Convert to notation? 
                                 # Notation for a big board? we don't have that. 
                                 # Just use "sub-board". Or maybe coordinates of the big board?
                                 # Let's say "wins sub-board".
                                 reason = "allows opponent to win sub-board"
                             else:
                                 reason = "allows positional advantage"
                                 
                                  
                             feedback += f"\nOpponent plays {ref_not} ({reason})."
                         else:
                             feedback += " (No clear refutation found)."
                     else:
                         feedback += " (No opponent moves found?)"
                     
                     # Revert state
                     winners[move.cell] = was_w
                     board[move.cell*9 + move.subcell] = None

            
            # Append result
            analysis_results.append({
                'move_no': move.move_no,
                'player': move.player,
                'score': actual_move_score if classification != "forced" else 0,
                'best_score': best_val if classification != "forced" else 0,
                'diff': diff,
                'classification': classification,
                'feedback': feedback,
                'best_move': best_move_coords,
                'notation': EvaluationService.to_notation(move.cell, move.subcell),
                'refutation': refutation_notation
            })
            
            # Apply move to state for next iteration
            board[move.cell*9 + move.subcell] = move.player
            winners[move.cell] = HardBotLogic.check_line_local_array(board[move.cell*9 : (move.cell+1)*9])
            
        return analysis_results

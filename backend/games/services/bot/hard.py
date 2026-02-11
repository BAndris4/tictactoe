import random
from ...models import Game, GameMove
from ...logic import GameLogic

class HardBotLogic:
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
        macro_weights = [w['corner_subboard'], w['edge_subboard'], w['corner_subboard'],
                         w['edge_subboard'], w['center_subboard'], w['edge_subboard'],
                         w['corner_subboard'], w['edge_subboard'], w['corner_subboard']]
        
        for i in range(9):
            if winners[i] == bot: score += w['subboard_win'] * macro_weights[i]
            elif winners[i] == opp: score -= w['subboard_win'] * macro_weights[i]
        
        score += HardBotLogic.eval_lines(winners, bot, opp, w['two_in_line'], w['one_in_line'])

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
            return None

        moves_qs = GameMove.objects.filter(game_id=game.id)
        board = [None]*81
        winners = [None]*9
        for m in moves_qs: board[m.cell*9+m.subcell] = m.player
        for i in range(9): winners[i] = HardBotLogic.check_line_local_array(board[i*9:(i+1)*9])

        valid = HardBotLogic.get_valid_moves(board, winners, game.next_board_constraint)
        if not valid:
            return None
        
        if difficulty > 0 and random.randint(1, 100) <= difficulty:
            best_move = random.choice(valid)
            return GameMove.objects.create(game=game, move_no=game.move_count+1, player=bot_symbol, cell=best_move[0], subcell=best_move[1])

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

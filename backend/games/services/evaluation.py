from ..models import Game, GameMove
from .bot.hard import HardBotLogic

class EvaluationService:
    @staticmethod
    def to_notation(cell, subcell):
        global_row = (cell // 3) * 3 + (subcell // 3)
        global_col = (cell % 3) * 3 + (subcell % 3)
        
        # Notation: a-i for cols, 1-9 for rows (Top 1 to Bottom 9)
        col_char = chr(ord('a') + global_col)
        row_char = str(global_row + 1)
        
        return f"{col_char}{row_char}"

    @staticmethod
    def calculate_game_analysis(game_id):
        # 1. Fetch Game and Moves
        game = Game.objects.get(id=game_id)
        all_moves = list(GameMove.objects.filter(game=game).order_by('move_no'))
        
        analysis_results = []
        board = [None] * 81
        winners = [None] * 9
        
        # Replay the game to build state at each step
        for i, move in enumerate(all_moves):
            # Determine constraint based on previous move
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
            second_best_val = -float('inf') if is_x else float('inf')
            
            best_move_coords = None
            valid_moves = HardBotLogic.get_valid_moves(board, winners, constraint)
            
            if len(valid_moves) == 1:
                best_val = 0
                classification = "forced"
                feedback = "Forced move."
                diff = 0
                best_move_coords = valid_moves[0]
                actual_move_score = 0
                refutation_notation = None
            else:
                 valid_moves.sort(key=lambda m: (0 if m[1]==4 else 1, 0 if m[0]==4 else 1))
                 alpha = -float('inf')
                 beta = float('inf')
                 actual_move_score = None
                 
                 for b, s in valid_moves:
                    is_actual_move = (b == move.cell and s == move.subcell)
                    board[b*9+s] = move.player
                    was = winners[b]
                    winners[b] = HardBotLogic.check_line_local_array(board[b*9 : (b+1)*9])
                    nc = s if winners[s] is None and not all(board[s*9+k] is not None for k in range(9)) else None
                    val = HardBotLogic.minimax(board, winners, nc, depth=2, is_max=not is_x, alpha=alpha, beta=beta, bot='X', opp='O')
                    
                    board[b*9+s] = None
                    winners[b] = was
                    
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
                 
                 if actual_move_score is None: actual_move_score = best_val

                 if is_x: diff = best_val - actual_move_score
                 else: diff = actual_move_score - best_val
                 
                 classification = "neutral"
                 feedback = ""
                 refutation_notation = None
                 
                 is_brilliant = False
                 if diff == 0:
                     margin = 0
                     if is_x: margin = best_val - second_best_val
                     else: margin = second_best_val - best_val
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

                 if classification in ['mistake', 'blunder']:
                     board[move.cell*9 + move.subcell] = move.player
                     was_w = winners[move.cell]
                     winners[move.cell] = HardBotLogic.check_line_local_array(board[move.cell*9 : (move.cell+1)*9])
                     next_constraint = move.subcell if winners[move.subcell] is None and not all(board[move.subcell*9+k] is not None for k in range(9)) else None
                     
                     opp_moves = HardBotLogic.get_valid_moves(board, winners, next_constraint)
                     if opp_moves:
                         opp_val = -float('inf') if not is_x else float('inf')
                         opp_best = None
                         for ob, os in opp_moves:
                             board[ob*9+os] = 'O' if is_x else 'X'
                             ww = winners[ob]
                             winners[ob] = HardBotLogic.check_line_local_array(board[ob*9 : (ob+1)*9])
                             current_val = HardBotLogic.evaluate(board, winners, 'X', 'O') 
                             board[ob*9+os] = None
                             winners[ob] = ww
                             
                             if not is_x: 
                                 if current_val > opp_val:
                                     opp_val = current_val
                                     opp_best = (ob, os)
                             else: 
                                 if current_val < opp_val:
                                     opp_val = current_val
                                     opp_best = (ob, os)
                         
                         if opp_best:
                             ref_not = EvaluationService.to_notation(opp_best[0], opp_best[1])
                             refutation_notation = ref_not
                             ob, os = opp_best
                             board[ob*9+os] = 'O' if is_x else 'X'
                             ww = winners[ob]
                             winners[ob] = HardBotLogic.check_line_local_array(board[ob*9 : (ob+1)*9])
                             global_win = HardBotLogic.check_line_local_array(winners)
                             sub_win = winners[ob]
                             board[ob*9+os] = None
                             winners[ob] = ww
                             
                             reason = ""
                             if global_win: reason = "allows forced win"
                             elif sub_win: reason = "allows opponent to win sub-board"
                             else: reason = "allows positional advantage"
                             feedback += f"\nOpponent plays {ref_not} ({reason})."
                         else:
                             feedback += " (No clear refutation found)."
                     else:
                         feedback += " (No opponent moves found?)"
                     
                     winners[move.cell] = was_w
                     board[move.cell*9 + move.subcell] = None

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
            
            board[move.cell*9 + move.subcell] = move.player
            winners[move.cell] = HardBotLogic.check_line_local_array(board[move.cell*9 : (move.cell+1)*9])
            
        return analysis_results

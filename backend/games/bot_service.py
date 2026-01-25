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
            if not GameLogic.is_subboard_full(game.id, target_subboard):
                 possible_boards = [target_subboard]
            else:
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

class BotService:
    @staticmethod
    async def process_bot_move(game_id, channel_layer, group_name):
        # Add delay for realism
        import asyncio
        await asyncio.sleep(1) 
         
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

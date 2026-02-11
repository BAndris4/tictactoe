import asyncio
from channels.db import database_sync_to_async
from ...models import Game, GameMove
from ...logic import GameLogic
from .chat import BotChatService
from .easy import EasyBotLogic
from .medium import MediumBotLogic
from .hard import HardBotLogic

class BotService:
    @staticmethod
    async def process_bot_move(game_id, channel_layer, group_name):
        await asyncio.sleep(1) 
        
        # Determine strict mode
        game = await database_sync_to_async(Game.objects.get)(id=game_id)
        
        if game.status != 'active':
            return

        # Check if it's actually bot's turn
        is_bot_x = game.player_x_id is None
        is_bot_o = game.player_o_id is None
        
        is_bot_turn = (game.current_turn == 'X' and is_bot_x) or (game.current_turn == 'O' and is_bot_o)
        
        if not is_bot_turn:
            return

        # --- BOT CHAT AGENT (Greeting & Chatter) ---
        bot_symbol = game.current_turn
        if game.move_count <= 1:
             await BotChatService.maybe_send_chat(game, bot_symbol, 'greeting', channel_layer, group_name)
        
        # --- REACTION TO OPPONENT MOVE ---
        last_move = await database_sync_to_async(GameMove.objects.filter(game=game).last)()
        if last_move and last_move.player != bot_symbol:
            # Opponent just moved. Did they win that subgrid?
            w = await database_sync_to_async(GameLogic.check_subboard_winner)(game_id, last_move.cell)
            if w and w == last_move.player:
                 # Opponent won a subgrid
                 await BotChatService.maybe_send_chat(game, bot_symbol, 'subgrid_loss', channel_layer, group_name)

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
            await database_sync_to_async(EasyBotLogic.finalize_move)(move)
            
            # 2. Check if the specific subboard (move.cell) is now won
            winner_of_subboard = await database_sync_to_async(GameLogic.check_subboard_winner)(game_id, move.cell)
            
            if winner_of_subboard:
                if winner_of_subboard == move.player:
                    # Bot won the subgrid
                    await BotChatService.maybe_send_chat(game, move.player, 'subgrid_win', channel_layer, group_name)
            
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
            
            # Reload game to check winner
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
         from ..broadcast_service import BroadcastService
         await BroadcastService.broadcast_game_over(game_id)

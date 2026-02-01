from channels.layers import get_channel_layer
from channels.db import database_sync_to_async
from .models import Game
from users.services import LevelingService

class BroadcastService:
    @staticmethod
    async def broadcast_game_over(game_id):
        """
        Calculates XP, MMR, and LP results, then broadcasts game_over to the room.
        Used by both GameConsumer and BotService.
        """
        channel_layer = get_channel_layer()
        room_group_name = f'game_{game_id}'
        
        # Fresh fetch of game object
        game = await database_sync_to_async(Game.objects.get)(id=game_id)
        
        if game.status != 'finished':
            return # Should not broadcast if not finished

        xp_results = {}
        ranking_results = {}
        mmr_results = {}
        lp_results = {}
        ranks = {}

        try:
            # Process Leveling (XP) - This runs for all modes
            xp_results = await database_sync_to_async(LevelingService.process_game_end)(game)
            
            # Process Ranking (MMR & LP) - ONLY if game is rated
            if game.rated:
                from users.ranking_service import RankingService
                ranking_results = await database_sync_to_async(RankingService.process_game_end)(game)
                mmr_results = ranking_results.get('mmr', {})
                lp_results = ranking_results.get('lp', {})
                ranks = ranking_results.get('ranks', {})
                
        except Exception as e:
            print(f"CRITICAL ERROR in game end processing broadcast: {e}")
            # We still proceed to send game_over even if stats fail
            
        await channel_layer.group_send(
            room_group_name,
            {
                'type': 'game_update',
                'data': {
                    'type': 'game_over',
                    'mode': game.mode,
                    'winner': game.winner,
                    'reason': 'board_full' if game.winner == 'D' else 'regular',
                    'xp_results': xp_results,
                    'mmr_results': mmr_results,
                    'lp_results': lp_results,
                    'ranks': ranks
                }
            }
        )

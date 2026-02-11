import random
from channels.db import database_sync_to_async
from ...bot_config import BOT_CONFIGS
from ...models import ChatMessage

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

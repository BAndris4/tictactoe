import json
from urllib.parse import parse_qs
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Game, GameMove, ChatMessage
from .logic import GameLogic
from .api.serializers import GameMoveSerializer
from users.tokens import get_user_from_access_token

class GameConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            self.game_id = self.scope['url_route']['kwargs']['game_id']
            self.room_group_name = f'game_{self.game_id}'
            
            # Extract token from query string
            query_string = self.scope.get("query_string", b"").decode("utf-8")
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]
            
            if not token:
                await self.close()
                return

            try:
                self.user = await self.validate_token(token)
            except Exception: # TokenExpired or InvalidToken
                await self.close()
                return

            # Check if game exists
            try:
                self.game = await self.get_game(self.game_id)
            except Game.DoesNotExist:
                await self.close()
                return

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )

            await self.accept()

            # If it's a bot game and it's bot's turn, trigger it
            if self.game.mode in ['bot_easy', 'bot_medium', 'bot_hard', 'bot_custom']:
                 user_id = self.user.id
                 is_player = (user_id == self.game.player_x_id or user_id == self.game.player_o_id)
                 if is_player:
                     from .services.bot.manager import BotService
                     import asyncio
                     asyncio.create_task(BotService.process_bot_move(self.game_id, self.channel_layer, self.room_group_name))

        except Exception as e:
            print(f"[GameConsumer] Critical Error in connect: {e}")
            import traceback
            traceback.print_exc()
            await self.close()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        action = text_data_json.get('action')

        if action == 'move':
            cell = text_data_json.get('cell')
            subcell = text_data_json.get('subcell')

            try:
                # Process move
                move, game = await self.process_move(cell, subcell)

                # Broadcast update
                await self.channel_layer.group_send(
                    self.room_group_name,
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

                # If game finished, broadcast game_over
                if game.status == 'finished':
                    from .broadcast_service import BroadcastService
                    await BroadcastService.broadcast_game_over(self.game_id)
                

                # --- BOT INTEGRATION ---
                if game.mode in ['bot_easy', 'bot_medium', 'bot_hard', 'bot_custom'] and game.status != 'finished':
                    # Trigger Bot Turn if game is active
                    from .services.bot.manager import BotService
                    # Run in background (don't await strictly? or await is fine)
                    import asyncio
                    asyncio.create_task(BotService.process_bot_move(self.game_id, self.channel_layer, self.room_group_name))

            except ValueError as e:
                # Send error message to THIS socket only
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': str(e)
                }))
            except Exception as e:
                print(f"[GameConsumer] Critical Error processing move: {e}")
                import traceback
                traceback.print_exc()
                await self.send(text_data=json.dumps({
                    'type': 'error',
                    'message': "Internal Server Error during move processing."
                }))

        elif action == 'chat_message':
            content = text_data_json.get('content')
            if content:
                # Save message
                msg = await self.save_chat_message(content)
                
                # Broadcast
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': {
                            'id': msg.id,
                            'sender': self.user.id,
                            'sender_name': self.user.username,
                            'content': msg.content,
                            'is_bot': False,
                            'timestamp': msg.timestamp.isoformat()
                        }
                    }
                )

        elif action == 'status_update':
            status_val = text_data_json.get('status') # 'active' or 'away'
            # Relay to room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'player_status_update',
                    'data': {
                        'type': 'player_status',
                        'sender': self.user.id,
                        'status': status_val
                    }
                }
            )

    async def player_status_update(self, event):
        await self.send(text_data=json.dumps(event['data']))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))
        
    @database_sync_to_async
    def has_chat_messages(self, game):
        return ChatMessage.objects.filter(game=game).exists()

    @database_sync_to_async
    def save_chat_message(self, content):
        return ChatMessage.objects.create(
            game=self.game,
            sender=self.user,
            sender_name=self.user.username,
            content=content
        )

    @database_sync_to_async
    def validate_token(self, token):
        # Handle "Bearer " prefix if present in query param (unlikely but safe)
        if token.startswith("Bearer "):
            token = token[len("Bearer "):]
        return get_user_from_access_token(token)

    @database_sync_to_async
    def get_game(self, game_id):
        return Game.objects.get(id=game_id)

    @database_sync_to_async
    def process_move(self, cell, subcell):
        user = self.user # Use the user authenticated at connect
        game = Game.objects.get(id=self.game_id)

        # Determine player char
        if game.mode == 'local' and user == game.player_x:
             # In local mode, the creator plays both sides (or hotseat)
             # We assume the move is for the current turn if validated
             player_char = game.current_turn
        elif game.mode in ['bot_easy', 'bot_medium', 'bot_hard', 'bot_custom']:
             # Allow move if user is the assigned player
             if user == game.player_x:
                 player_char = 'X'
             elif user == game.player_o:
                 player_char = 'O'
             else:
                 # Spectator or invalid
                 raise ValueError("You are not playing in this game.")
        elif user == game.player_x:
            player_char = 'X'
        elif user == game.player_o:
            player_char = 'O'
        else:
            raise ValueError("You are not a player in this game.")

        # Logic validation
        GameLogic.validate_move(game, player_char, cell, subcell)

        # Create move
        move = GameMove.objects.create(
            game=game,
            move_no=game.move_count + 1,
            player=player_char,
            cell=cell,
            subcell=subcell
        )
        
        # Update game state (turn, constraints, winner)
        GameLogic.update_game_state(game, move)
        
        return move, game

    async def game_update(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['data']))


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Extract token from query string
            query_string = self.scope.get("query_string", b"").decode("utf-8")
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]
            
            if not token:
                await self.close()
                return

            try:
                self.user = await self.validate_token(token)
            except Exception:
                await self.close()
                return

            self.user_group_name = f'user_notifications_{self.user.id}'

            # Join user group
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )

            await self.accept()
        except Exception:
            await self.close()

    async def disconnect(self, close_code):
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )

    async def receive(self, text_data):
        pass # No receive logic needed for now

    async def send_notification(self, event):
        # Send message to WebSocket
        await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def validate_token(self, token):
        if token.startswith("Bearer "):
            token = token[len("Bearer "):]
        return get_user_from_access_token(token)

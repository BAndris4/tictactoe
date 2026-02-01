import json
import asyncio
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from users.models import PlayerProfile
from games.models import Game

User = get_user_model()

# Global Matchmaking Queue
MATCHMAKING_QUEUE = []

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            from urllib.parse import parse_qs
            query_string = self.scope.get("query_string", b"").decode("utf-8")
            query_params = parse_qs(query_string)
            token = query_params.get("token", [None])[0]

            if not token:
                print("Matchmaking: No token provided")
                await self.close()
                return

            try:
                self.user = await self.validate_token(token)
            except Exception as e:
                print(f"Matchmaking: Token validation failed: {e}")
                await self.close()
                return

            await self.accept()
            print(f"Matchmaking connected: {self.user.username}")

        except Exception as e:
            print(f"Matchmaking: Connection error: {e}")
            await self.close()

    @database_sync_to_async
    def validate_token(self, token):
        from users.tokens import get_user_from_access_token
        if token.startswith("Bearer "):
            token = token[len("Bearer "):]
        return get_user_from_access_token(token)

    async def disconnect(self, close_code):
        global MATCHMAKING_QUEUE
        # Remove from queue if disconnected
        MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['channel_name'] != self.channel_name]
        print(f"Matchmaking disconnected: {self.user.username if hasattr(self, 'user') else 'Unknown'}")

    async def receive(self, text_data):
        # print(f"Matchmaking received: {text_data}") 
        try:
            data = json.loads(text_data)
            action = data.get("action")
            mode = data.get("mode", "unranked")

            if action == "search":
                await self.add_to_queue(mode)
            elif action == "cancel":
                await self.remove_from_queue()
        except Exception as e:
            print(f"Matchmaking receive error: {e}")

    async def add_to_queue(self, mode):
        global MATCHMAKING_QUEUE
        
        # Remove existing for this user
        MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['user_id'] != self.user.id]

        rating = await self.get_user_rating(mode)
        
        # JAVÍTÁS: Itt tároljuk el a username-t stringként, hogy könnyebb legyen kezelni
        profile, _ = await database_sync_to_async(PlayerProfile.objects.get_or_create)(user=self.user)
        avatar_config = profile.avatar_config

        entry = {
            'channel_name': self.channel_name,
            'user_id': self.user.id,
            'username': self.user.username, # JAVÍTVA: stringet tárolunk
            'user_obj': self.user,          # Megtartjuk az objektumot a create_game-hez
            'rating': rating,
            'mode': mode,
            'avatar_config': avatar_config,
            'joined_at': time.time()
        }
        
        MATCHMAKING_QUEUE.append(entry)
        
        print(f"Added to queue: {self.user.username} ({mode}, {rating}) - Queue size: {len(MATCHMAKING_QUEUE)}")
        
        await self.send(text_data=json.dumps({"status": "searching", "mode": mode}))

        # Trigger check
        asyncio.create_task(self.check_queue())

    async def remove_from_queue(self):
        global MATCHMAKING_QUEUE
        MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['channel_name'] != self.channel_name]
        print(f"Removed from queue: {self.user.username}")
        await self.send(text_data=json.dumps({"status": "cancelled"}))

    @database_sync_to_async
    def get_user_rating(self, mode):
        from users.ranking_service import RankingService
        try:
            profile, _ = PlayerProfile.objects.get_or_create(user=self.user)
            if mode == "ranked":
                return profile.mmr if profile.mmr is not None else RankingService.STARTING_MMR
            return profile.level
        except Exception:
            return 1000

    @database_sync_to_async
    def create_game(self, user1_id, user2_id, mode):
        user1 = User.objects.get(id=user1_id)
        user2 = User.objects.get(id=user2_id)
        
        game = Game.objects.create(
            mode=mode,
            player_x=user1,
            player_o=user2,
            status='active',
            current_turn='X',
            rated=(mode == 'ranked')
        )
        return game.id

    async def check_queue(self):
        global MATCHMAKING_QUEUE
        
        # 1. Megkeressük magunkat a sorban
        me = next((p for p in MATCHMAKING_QUEUE if p['channel_name'] == self.channel_name), None)
        if not me:
            return 

        # JAVÍTÁS: user object helyett a username mezőt használjuk a logoláshoz, ami már string
        print(f"Checking queue for {me['username']} (Mode: {me['mode']})...")

        # 2. Keresünk ellenfelet
        candidates = [p for p in MATCHMAKING_QUEUE if p['user_id'] != me['user_id'] and p['mode'] == me['mode']]
        
        if not candidates:
            # print("No candidates found yet.")
            return

        # 3. Párosítás (egyszerűsített)
        opponent = candidates[0] 

        print(f"MATCH FOUND: {me['username']} vs {opponent['username']}")
        
        # Törlés a sorból
        MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['channel_name'] not in (me['channel_name'], opponent['channel_name'])]
        
        try:
            game_id = await self.create_game(me['user_id'], opponent['user_id'], me['mode'])
            
            # Értesítés
            opponent_label = f"{opponent['rating']} MMR" if me['mode'] == 'ranked' else f"Lvl {opponent['rating']}"
            me_label = f"{me['rating']} MMR" if me['mode'] == 'ranked' else f"Lvl {me['rating']}"

            # Én értesítése
            await self.send(text_data=json.dumps({
                "status": "match_found",
                "game_id": str(game_id),
                "opponent": opponent_label,
                "opponent_username": opponent['username'],
                "opponent_avatar": opponent.get('avatar_config')
            }))

            # Ellenfél értesítése
            await self.channel_layer.send(
                opponent['channel_name'],
                {
                    "type": "match_found_event",
                    "game_id": str(game_id),
                    "opponent": me_label,
                    "opponent_username": me['username'],
                    "opponent_avatar": me.get('avatar_config')
                }
            )
        except Exception as e:
            print(f"Error creating match: {e}")

    async def match_found_event(self, event):
        await self.send(text_data=json.dumps({
            "status": "match_found",
            "game_id": event["game_id"],
            "opponent": event.get("opponent"),
            "opponent_username": event.get("opponent_username"),
            "opponent_avatar": event.get("opponent_avatar")
        }))

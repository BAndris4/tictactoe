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
# Format: { 'channel_name': str, 'user_id': int, 'user': User, 'rating': int, 'mode': str, 'joined_at': float }
MATCHMAKING_QUEUE = []

class MatchmakingConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        try:
            # Extract token from query string
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
        # Remove from queue if disconnected
        global MATCHMAKING_QUEUE
        MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['channel_name'] != self.channel_name]
        print(f"Matchmaking disconnected: {self.user.username}")

    async def receive(self, text_data):
        data = json.loads(text_data)
        action = data.get("action")
        mode = data.get("mode", "unranked") # 'unranked' or 'ranked'

        if action == "search":
            await self.add_to_queue(mode)
        elif action == "cancel":
            await self.remove_from_queue()

    async def add_to_queue(self, mode):
        # Prevent duplicates
        global MATCHMAKING_QUEUE
        # Check if already in queue (by user_id)
        if any(p['user_id'] == self.user.id for p in MATCHMAKING_QUEUE):
            return

        rating = await self.get_user_rating(mode)
        
        entry = {
            'channel_name': self.channel_name,
            'user_id': self.user.id,
            'user': self.user, 
            'rating': rating,
            'mode': mode,
            'joined_at': time.time()
        }
        
        MATCHMAKING_QUEUE.append(entry)
        await self.send(text_data=json.dumps({"status": "searching", "mode": mode}))
        
        # Trigger matchmaking check
        asyncio.create_task(self.check_queue())

    async def remove_from_queue(self):
        global MATCHMAKING_QUEUE
        MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['channel_name'] != self.channel_name]
        await self.send(text_data=json.dumps({"status": "cancelled"}))

    @database_sync_to_async
    def get_user_rating(self, mode):
        from users.ranking_service import RankingService
        profile, _ = PlayerProfile.objects.get_or_create(user=self.user)
        if mode == "ranked":
            return profile.mmr if profile.mmr is not None else RankingService.STARTING_MMR
        return profile.level
    
    @database_sync_to_async
    def create_game(self, user1_id, user2_id, mode):
        user1 = User.objects.get(id=user1_id)
        user2 = User.objects.get(id=user2_id)
        
        # Create game
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
        
        # Simple greedy match for THIS user
        me = next((p for p in MATCHMAKING_QUEUE if p['channel_name'] == self.channel_name), None)
        if not me: 
            return # I'm not in queue

        # Find opponent with SAME mode
        opponent = None
        now = time.time()
        my_wait = now - me['joined_at']
        
        # If > 30s, we might expand search
        force_match = my_wait > 30
        
        best_candidate = None
        min_diff = 999999
        
        # Only consider candidates in the same mode
        candidates = [p for p in MATCHMAKING_QUEUE if p['user_id'] != me['user_id'] and p['mode'] == me['mode']]
        
        # Thresholds
        threshold = 100 if me['mode'] == 'ranked' else 10

        for candidate in candidates:
            diff = abs(candidate['rating'] - me['rating'])
            
            if force_match:
                if diff < min_diff:
                    min_diff = diff
                    best_candidate = candidate
            else:
                if diff <= threshold:
                    best_candidate = candidate
                    break
        
        opponent = best_candidate
        
        if opponent:
            # We found a match!
            MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['channel_name'] not in (me['channel_name'], opponent['channel_name'])]
            
            game_id = await self.create_game(me['user_id'], opponent['user_id'], me['mode'])
            
            # Notify both
            opponent_label = f"{opponent['rating']} MMR" if me['mode'] == 'ranked' else f"Lvl {opponent['rating']}"
            me_label = f"{me['rating']} MMR" if me['mode'] == 'ranked' else f"Lvl {me['rating']}"

            await self.channel_layer.send(
                me['channel_name'],
                {
                    "type": "match_found",
                    "game_id": str(game_id),
                    "opponent": opponent_label,
                    "opponent_username": opponent['user'].username
                }
            )
            
            await self.channel_layer.send(
                opponent['channel_name'],
                {
                    "type": "match_found",
                    "game_id": str(game_id),
                    "opponent": me_label,
                    "opponent_username": me['user'].username
                }
            )

    async def match_found(self, event):
        await self.send(text_data=json.dumps({
            "status": "match_found",
            "game_id": event["game_id"],
            "opponent": event.get("opponent"),
            "opponent_username": event.get("opponent_username")
        }))

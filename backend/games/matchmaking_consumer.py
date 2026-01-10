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
# Format: { 'channel_name': str, 'user_id': int, 'level': int, 'joined_at': float }
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

        if action == "search":
            await self.add_to_queue()
        elif action == "cancel":
            await self.remove_from_queue()

    async def add_to_queue(self):
        # Prevent duplicates
        global MATCHMAKING_QUEUE
        # Check if already in queue (by user_id)
        if any(p['user_id'] == self.user.id for p in MATCHMAKING_QUEUE):
            return

        level = await self.get_user_level()
        
        entry = {
            'channel_name': self.channel_name,
            'user_id': self.user.id,
            'user': self.user, # Store user object for username access
            'level': level,
            'joined_at': time.time(),
            'consumer': self # Keep reference to consumer to send directly? No, use channel_layer.
        }
        
        MATCHMAKING_QUEUE.append(entry)
        await self.send(text_data=json.dumps({"status": "searching"}))
        
        # Trigger matchmaking check
        asyncio.create_task(self.check_queue())

    async def remove_from_queue(self):
        global MATCHMAKING_QUEUE
        MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['channel_name'] != self.channel_name]
        await self.send(text_data=json.dumps({"status": "cancelled"}))

    @database_sync_to_async
    def get_user_level(self):
        profile, _ = PlayerProfile.objects.get_or_create(user=self.user)
        return profile.level
    
    @database_sync_to_async
    def create_game(self, user1_id, user2_id):
        user1 = User.objects.get(id=user1_id)
        user2 = User.objects.get(id=user2_id)
        
        # Create game
        # Who is X? Randomize or first? Let's say User1 is X.
        game = Game.objects.create(
            mode='unranked',
            player_x=user1,
            player_o=user2,
            status='active',
            current_turn='X'
        )
        return game.id

    async def check_queue(self):
        """
        Runs matchmaking logic.
        This is a bit naive (run by every consumer), but simpler than a background worker.
        Ideally we use a lock or a single worker.
        With global var in single process, it's safer but concurrency issues might exist.
        For MVP, we lock or just be careful.
        """
        global MATCHMAKING_QUEUE
        
        print(f"Checking queue. Current size: {len(MATCHMAKING_QUEUE)}")
        for p in MATCHMAKING_QUEUE:
            print(f" - User {p['user_id']} ({p['channel_name']}): Level {p['level']}")

        if len(MATCHMAKING_QUEUE) < 2:
            print("Not enough players to match.")
            return

        # Simple greedy match for THIS user
        # Find "me" in queue
        me = next((p for p in MATCHMAKING_QUEUE if p['channel_name'] == self.channel_name), None)
        if not me: 
            print("Current user not found in queue (maybe removed?)")
            return # I'm not in queue

        # Find opponent
        opponent = None
        now = time.time()
        my_wait = now - me['joined_at']
        
        # Rule 2: If > 30s, match with closest level
        force_match = my_wait > 30
        print(f"Matching for {me['user_id']} (Level {me['level']}). Wait time: {my_wait:.2f}s. Force match: {force_match}")
        
        best_candidate = None
        min_level_diff = 1000
        
        candidates = [p for p in MATCHMAKING_QUEUE if p['user_id'] != me['user_id']]
        print(f"Found {len(candidates)} candidates.")
        
        for candidate in candidates:
            # Check if candidate wait time > 30s also triggers force match? 
            # Logic: "Ha fél percen belül nem talál, akkor bárkivel"
            # So if MY wait > 30, I accept anyone.
            
            level_diff = abs(candidate['level'] - me['level'])
            print(f" - Checking candidate {candidate['user_id']} (Level {candidate['level']}). Diff: {level_diff}")
            
            if force_match:
                # Find closest level
                if level_diff < min_level_diff:
                    min_level_diff = level_diff
                    best_candidate = candidate
            else:
                # Rule 1: +- 10 levels
                if level_diff <= 10:
                    # Found a match!
                    best_candidate = candidate
                    print("Match found via Rule 1 (<= 10 diff)")
                    break # Take first valid
        
        opponent = best_candidate
        
        if opponent:
            # We found a match!
            # Remove both from queue immediately to prevent double matching
            # Filter out both
            MATCHMAKING_QUEUE = [p for p in MATCHMAKING_QUEUE if p['channel_name'] not in (me['channel_name'], opponent['channel_name'])]
            
            # Create Game
            game_id = await self.create_game(me['user_id'], opponent['user_id'])
            
            # Notify both
            await self.channel_layer.send(
                me['channel_name'],
                {
                    "type": "match_found",
                    "game_id": str(game_id),
                    "opponent": f"Lvl {opponent['level']}",
                    "opponent_username": opponent['user'].username
                }
            )
            
            await self.channel_layer.send(
                opponent['channel_name'],
                {
                    "type": "match_found",
                    "game_id": str(game_id),
                    "opponent": f"Lvl {me['level']}",
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

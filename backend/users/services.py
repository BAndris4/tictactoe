from __future__ import annotations

from typing import Optional

from django.contrib.auth import authenticate, get_user_model
from django.db import IntegrityError, transaction, models

from .models import Friendship, FriendshipStatus, PlayerProfile
User = get_user_model()


class UsernameAlreadyTaken(Exception):
    pass


class EmailAlreadyTaken(Exception):
    pass

class LevelingService:

    X_PARAM = 0.0063
    Y_PARAM = 1.027

    @classmethod
    def get_xp_required_for_level(cls, level):
        return min([int((level / cls.X_PARAM) ** cls.Y_PARAM), 5000])

    @staticmethod
    def calculate_stats_and_xp(game, player_char):
        """Kiszámolja mennyi XP jár az adott meccsért"""
        from games.models import GameMove
        from games.logic import GameLogic
        # 1. Lépések (DB-ből)
        moves_count = GameMove.objects.filter(game=game, player=player_char).count()
        
        # 2. Mini tábla győzelmek (Logika segítségével újraszámolva)
        mini_wins = 0
        for i in range(9):
            if GameLogic.check_subboard_winner(game.id, i) == player_char:
                mini_wins += 1
                
        # XP Összegzés
        xp = 0
        xp += moves_count * 5
        xp += mini_wins * 20      
        
        # Győzelem / Döntetlen / Vereség
        if game.winner == player_char:
            xp += 100
        elif game.winner == 'D':
            xp += 75
        else:
            xp += 50
            
        return xp

    @classmethod
    def process_game_end(cls, game):
        """
        GameConsumer hívja meg, amikor game.status='finished'.
        Visszatér egy dict-tel: { user_id: { xp_data... } }
        """
        results = {}
        
        # Tuple lista: (User objektum, Karakter 'X'/'O')
        players = []
        if game.player_x: players.append((game.player_x, 'X'))
        if game.player_o: players.append((game.player_o, 'O'))

        for user, char in players:
            # Profil lekérése (vagy létrehozása, ha valamiért nincs - bár a signal miatt kéne lennie)
            profile, _ = PlayerProfile.objects.get_or_create(user=user)
            
            with transaction.atomic():
                # Friss XP kiszámolása
                xp_gained = cls.calculate_stats_and_xp(game, char)
                
                # Hozzáadás
                profile.current_xp += xp_gained
                profile.total_xp += xp_gained
                
                # Szintlépés ellenőrzése (while ciklus, ha többet is lépne egyszerre)
                leveled_up = False
                while True:
                    needed = cls.get_xp_required_for_level(profile.level)
                    if profile.current_xp >= needed:
                        profile.current_xp -= needed
                        profile.level += 1
                        leveled_up = True
                    else:
                        break
                
                profile.save()

                # Eredmény összeállítása a frontendnek
                results[user.id] = {
                    'xp_gained': xp_gained,
                    'new_level': profile.level,
                    'leveled_up': leveled_up,
                    'xp_to_next': cls.get_xp_required_for_level(profile.level) - profile.current_xp,
                    'can_play_ranked': profile.can_play_ranked
                }
            
        return results
    

def register_user(
    *,
    username: str,
    email: str,
    password: str,
    first_name: str | None = None,
    last_name: str | None = None,
    phone_number: str | None = None,
) -> "User":
    if User.objects.filter(email=email).exists():
        raise EmailAlreadyTaken()

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name=first_name or "",
                last_name=last_name or "",
            )
            user.phone_number = phone_number
            user.save()
            return user
    except IntegrityError as e:
        if "username" in str(e):
            raise UsernameAlreadyTaken() from e
        raise


def authenticate_user(
    *,
    username: str,
    password: str,
) -> Optional[User]:
    user = authenticate(username=username, password=password)
    return user

def send_friend_request(*, from_user: User, to_username: str) -> Friendship:
    to_user = User.objects.get(username=to_username)
    
    if from_user == to_user:
        raise ValueError("You cannot send a friend request to yourself.")
    
    # Check if a relationship already exists
    existing = Friendship.objects.filter(
        (models.Q(from_user=from_user) & models.Q(to_user=to_user)) |
        (models.Q(from_user=to_user) & models.Q(to_user=from_user))
    ).first()
    
    if existing:
        if existing.status == FriendshipStatus.ACCEPTED:
            raise ValueError("You are already friends.")
        if existing.status == FriendshipStatus.PENDING:
            if existing.from_user == from_user:
                raise ValueError("Friend request already sent.")
            else:
                # The other user already sent a request, let's just accept it
                existing.status = FriendshipStatus.ACCEPTED
                existing.save()
                return existing
        if existing.status == FriendshipStatus.BLOCKED:
            if existing.from_user == from_user:
                raise ValueError("You have blocked this user.")
            else:
                raise ValueError("User has blocked you.")
        
        # If it reached here, status must be REJECTED
        # We update the existing record to be a new PENDING request from current user
        existing.from_user = from_user
        existing.to_user = to_user
        existing.status = FriendshipStatus.PENDING
        existing.save()
        return existing
    
    return Friendship.objects.create(from_user=from_user, to_user=to_user, status=FriendshipStatus.PENDING)

def respond_to_friend_request(*, friendship_id: int, user: User, status: str) -> Friendship:
    if status not in [FriendshipStatus.ACCEPTED, FriendshipStatus.REJECTED]:
        raise ValueError("Invalid status response.")
        
    friendship = Friendship.objects.get(id=friendship_id)
    
    if friendship.to_user != user:
        raise ValueError("You can only respond to requests sent to you.")
        
    if friendship.status != FriendshipStatus.PENDING:
        raise ValueError("This request has already been processed.")
        
    friendship.status = status
    friendship.save()
    return friendship

def unfriend_user(*, user: User, target_username: str):
    target_user = User.objects.get(username=target_username)
    
    Friendship.objects.filter(
        (models.Q(from_user=user) & models.Q(to_user=target_user)) |
        (models.Q(from_user=target_user) & models.Q(to_user=user)),
        status=FriendshipStatus.ACCEPTED
    ).delete()

def block_user(*, user: User, target_username: str) -> Friendship:
    target_user = User.objects.get(username=target_username)
    
    # Remove any existing relationship and create a blocked one
    Friendship.objects.filter(
        (models.Q(from_user=user) & models.Q(to_user=target_user)) |
        (models.Q(from_user=target_user) & models.Q(to_user=user))
    ).delete()
    
    return Friendship.objects.create(from_user=user, to_user=target_user, status=FriendshipStatus.BLOCKED)

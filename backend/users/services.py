from __future__ import annotations

from typing import Optional

from django.contrib.auth import authenticate, get_user_model
from django.db import IntegrityError, transaction, models

from .models import Friendship, FriendshipStatus
User = get_user_model()


class UsernameAlreadyTaken(Exception):
    pass


class EmailAlreadyTaken(Exception):
    pass


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

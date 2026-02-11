from django.contrib.auth import get_user_model
from django.db import models
from ..models import Friendship, FriendshipStatus

User = get_user_model()

def send_friend_request(*, from_user: User, to_username: str):
    to_user = User.objects.get(username=to_username)
    
    if from_user == to_user:
        raise ValueError("You cannot send a friend request to yourself.")
    
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
                existing.status = FriendshipStatus.ACCEPTED
                existing.save()
                return existing
        if existing.status == FriendshipStatus.BLOCKED:
            if existing.from_user == from_user:
                raise ValueError("You have blocked this user.")
            else:
                raise ValueError("User has blocked you.")
        
        existing.from_user = from_user
        existing.to_user = to_user
        existing.status = FriendshipStatus.PENDING
        existing.save()
        return existing
    
    return Friendship.objects.create(from_user=from_user, to_user=to_user, status=FriendshipStatus.PENDING)

def respond_to_friend_request(*, friendship_id: int, user: User, status: str):
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

def block_user(*, user: User, target_username: str):
    target_user = User.objects.get(username=target_username)
    
    Friendship.objects.filter(
        (models.Q(from_user=user) & models.Q(to_user=target_user)) |
        (models.Q(from_user=target_user) & models.Q(to_user=user))
    ).delete()
    
    return Friendship.objects.create(from_user=user, to_user=target_user, status=FriendshipStatus.BLOCKED)

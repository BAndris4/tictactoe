from __future__ import annotations

from typing import Optional

from django.contrib.auth import get_user_model
from django.db.models import Q, QuerySet
from .models import Friendship, FriendshipStatus

User = get_user_model()


def get_user_by_id(user_id: int) -> Optional[User]:
    return User.objects.filter(id=user_id).first()


def get_user_by_username(username: str) -> Optional[User]:
    return User.objects.filter(username=username).first()


def get_user_by_email(email: str) -> Optional[User]:
    return User.objects.filter(email=email).first()

def get_pending_friend_requests(user: User) -> QuerySet[Friendship]:
    return Friendship.objects.filter(to_user=user, status=FriendshipStatus.PENDING)

def get_friends_list(user: User) -> QuerySet[User]:
    friendships = Friendship.objects.filter(
        (Q(from_user=user) | Q(to_user=user)),
        status=FriendshipStatus.ACCEPTED
    )
    
    friend_ids = []
    for f in friendships:
        if f.from_user_id == user.id:
            friend_ids.append(f.to_user_id)
        else:
            friend_ids.append(f.from_user_id)
            
    return User.objects.filter(id__in=friend_ids)
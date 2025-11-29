from __future__ import annotations

from typing import Optional

from django.contrib.auth import get_user_model

User = get_user_model()


def get_user_by_id(user_id: int) -> Optional[User]:
    return User.objects.filter(id=user_id).first()


def get_user_by_username(username: str) -> Optional[User]:
    return User.objects.filter(username=username).first()


def get_user_by_email(email: str) -> Optional[User]:
    return User.objects.filter(email=email).first()
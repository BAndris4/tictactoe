# users/tokens.py
from __future__ import annotations

from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

ALGORITHM = "HS256"
ACCESS_TOKEN_LIFETIME_MINUTES = 60
REMEMBER_ME_LIFETIME_DAYS = 30


class TokenError(Exception):
    """Base class for token-related errors."""
    pass


class TokenExpired(TokenError):
    """Raised when a token is expired."""
    pass


class InvalidToken(TokenError):
    """Raised when a token is invalid for any reason."""
    pass


def create_access_token(user: User, *, remember: bool = False) -> str:
    now = datetime.now(timezone.utc)

    if remember:
        exp = now + timedelta(days=REMEMBER_ME_LIFETIME_DAYS)
    else:
        exp = now + timedelta(minutes=ACCESS_TOKEN_LIFETIME_MINUTES)

    payload = {
        "sub": str(user.id),
        "username": user.username,
        "type": "access",
        "iat": int(now.timestamp()),
        "exp": int(exp.timestamp()),
    }

    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=ALGORITHM)
    return token


def get_user_from_access_token(token: str) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError as e:
        raise TokenExpired("Token expired") from e
    except jwt.InvalidTokenError as e:
        raise InvalidToken("Invalid token") from e

    if payload.get("type") != "access":
        raise InvalidToken("Invalid token type")

    user_id = payload.get("sub")
    if not user_id:
        raise InvalidToken("Missing subject")

    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist as e:
        raise InvalidToken("User not found") from e

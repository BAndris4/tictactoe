from datetime import datetime, timedelta, timezone

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

ALGORITHM = "HS256"
ACCESS_TOKEN_LIFETIME_MINUTES = 60
REMEMBER_ME_LIFETIME_DAYS = 30


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

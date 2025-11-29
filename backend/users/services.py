from __future__ import annotations

from typing import Optional

from django.contrib.auth import authenticate, get_user_model
from django.db import IntegrityError, transaction

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

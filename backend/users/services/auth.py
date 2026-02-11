from django.contrib.auth import authenticate, get_user_model
from django.db import IntegrityError, transaction
from ..models import PlayerProfile
from .avatar import AvatarService

User = get_user_model()

class UsernameAlreadyTaken(Exception): pass
class EmailAlreadyTaken(Exception): pass

def register_user(
    *,
    username: str,
    email: str,
    password: str,
    first_name: str | None = None,
    last_name: str | None = None,
    phone_number: str | None = None,
    gender: str = 'M',
    avatar_config: dict | None = None,
):
    if User.objects.filter(username=username).exists():
        raise UsernameAlreadyTaken(f"Username '{username}' is already taken.")
    if User.objects.filter(email=email).exists():
        raise EmailAlreadyTaken(f"Email '{email}' is already taken.")

    with transaction.atomic():
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name or "",
            last_name=last_name or "",
        )
        
        # Profile creation
        final_avatar = avatar_config or AvatarService.generate_random_avatar(gender)
        
        PlayerProfile.objects.create(
            user=user,
            phone_number=phone_number,
            gender=gender,
            avatar_config=final_avatar
        )
        
        return user

def authenticate_user(
    *,
    username: str,
    password: str,
):
    user = authenticate(username=username, password=password)
    return user

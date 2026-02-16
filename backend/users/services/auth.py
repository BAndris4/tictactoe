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
        
        from ..models import PlayerProfile, AvatarConfig
        
        # Check if profile already exists (e.g. from signal)
        profile, created = PlayerProfile.objects.get_or_create(user=user)
        
        profile.gender = gender
        profile.save()

        # Create AvatarConfig
        AvatarConfig.objects.create(
            player_profile=profile,
            top_type=final_avatar.get('topType', ''),
            accessories_type=final_avatar.get('accessoriesType', ''),
            hair_color=final_avatar.get('hairColor', ''),
            facial_hair_type=final_avatar.get('facialHairType', ''),
            clothe_type=final_avatar.get('clotheType', ''),
            eye_type=final_avatar.get('eyeType', ''),
            eyebrow_type=final_avatar.get('eyebrowType', ''),
            mouth_type=final_avatar.get('mouthType', ''),
            skin_color=final_avatar.get('skinColor', ''),
        )
        
        return user

def authenticate_user(
    *,
    username: str,
    password: str,
):
    user = authenticate(username=username, password=password)
    return user

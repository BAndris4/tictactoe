import pytest
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def create_user(db):
    def make_user(username="testuser", email="test@example.com", password="password123", **kwargs):
        avatar_config = kwargs.pop("avatar_config", {})
        user = User.objects.create_user(username=username, email=email, password=password, **kwargs)
        from users.models import PlayerProfile, AvatarConfig
        profile, created = PlayerProfile.objects.get_or_create(user=user)
        if avatar_config:
             AvatarConfig.objects.update_or_create(
                 player_profile=profile,
                 defaults={
                     "top_type": avatar_config.get('topType', ''),
                     "accessories_type": avatar_config.get('accessoriesType', ''),
                     "hair_color": avatar_config.get('hairColor', ''),
                     "facial_hair_type": avatar_config.get('facialHairType', ''),
                     "clothe_type": avatar_config.get('clotheType', ''),
                     "eye_type": avatar_config.get('eyeType', ''),
                     "eyebrow_type": avatar_config.get('eyebrowType', ''),
                     "mouth_type": avatar_config.get('mouthType', ''),
                     "skin_color": avatar_config.get('skinColor', ''),
                 }
             )
        return user
    return make_user

@pytest.fixture
def auth_client(api_client, create_user):
    user = create_user()
    from users.tokens import create_access_token
    token = create_access_token(user=user)
    api_client.cookies['access_token'] = f"Bearer {token}"
    return api_client, user

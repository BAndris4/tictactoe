import pytest
from django.contrib.auth import get_user_model
from users.services.auth import register_user, authenticate_user, UsernameAlreadyTaken, EmailAlreadyTaken
from users.models import PlayerProfile

User = get_user_model()

@pytest.mark.django_db
class TestAuthServices:
    def test_register_user_success(self):
        user = register_user(
            username="newuser",
            email="new@example.com",
            password="StrongPassword123!",
            gender="F"
        )
        assert User.objects.count() == 1
        assert user.username == "newuser"
        assert user.email == "new@example.com"
        assert user.check_password("StrongPassword123!")
        
        # Check profile creation
        profile = PlayerProfile.objects.get(user=user)
        assert profile.gender == "F"
        assert profile.get_avatar_config() != {}

    def test_register_user_duplicate_username(self, create_user):
        create_user(username="taken_user")
        
        with pytest.raises(UsernameAlreadyTaken):
            register_user(
                username="taken_user",
                email="other@example.com",
                password="password"
            )

    def test_register_user_duplicate_email(self, create_user):
        create_user(email="taken@example.com")
        
        with pytest.raises(EmailAlreadyTaken):
            register_user(
                username="other_user",
                email="taken@example.com",
                password="password"
            )

    def test_authenticate_user_success(self, create_user):
        create_user(username="valid_user", password="correct_password")
        
        user = authenticate_user(username="valid_user", password="correct_password")
        assert user is not None
        assert user.username == "valid_user"

    def test_authenticate_user_invalid_password(self, create_user):
        create_user(username="valid_user", password="correct_password")
        
        user = authenticate_user(username="valid_user", password="wrong_password")
        assert user is None

    def test_authenticate_user_nonexistent(self):
        user = authenticate_user(username="ghost", password="password")
        assert user is None

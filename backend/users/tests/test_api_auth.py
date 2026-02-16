import pytest
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

@pytest.mark.django_db
class TestAuthAPI:
    def test_register_api_success(self, api_client):
        url = reverse('register')
        data = {
            "username": "apiuser",
            "email": "api@example.com",
            "password": "ApiPassword123",
            "gender": "M"
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['username'] == "apiuser"
        assert User.objects.count() == 1

    def test_register_api_duplicate_username(self, api_client, create_user):
        create_user(username="taken")
        url = reverse('register')
        data = {
            "username": "taken",
            "email": "new@example.com",
            "password": "password"
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Username already taken" in str(response.data)

    def test_register_api_duplicate_email(self, api_client, create_user):
        create_user(email="taken@example.com")
        url = reverse('register')
        data = {
            "username": "newuser",
            "email": "taken@example.com",
            "password": "password"
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Email already taken" in str(response.data) # Check for partial match

    def test_login_api_success(self, api_client, create_user):
        create_user(username="loginuser", password="password")
        url = reverse('login')
        data = {
            "username": "loginuser",
            "password": "password"
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_200_OK
        assert "access_token" in response.data
        assert "access_token" in response.cookies

    def test_login_api_invalid_credentials(self, api_client, create_user):
        create_user(username="loginuser", password="password")
        url = reverse('login')
        data = {
            "username": "loginuser",
            "password": "wrongpassword"
        }
        response = api_client.post(url, data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_me_api_authenticated(self, auth_client):
        client, user = auth_client
        url = reverse('me')
        response = client.get(url)
        assert response.status_code == status.HTTP_200_OK
        assert response.data['username'] == user.username
        assert 'profile' in response.data

    def test_me_api_unauthenticated(self, api_client):
        url = reverse('me')
        response = api_client.get(url)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

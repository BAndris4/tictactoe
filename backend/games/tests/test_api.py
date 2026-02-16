import pytest
from django.urls import reverse
from rest_framework import status
from games.models import Game

@pytest.mark.django_db
class TestGamesAPI:
    def test_create_game_api(self, auth_client):
        client, user = auth_client
        url = reverse('create_game')
        data = {"mode": "local"}
        response = client.post(url, data)
        
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['mode'] == "local"
        assert response.data['player_x'] == user.id
        assert Game.objects.count() == 1

    def test_join_game_api(self, api_client, create_user):
        user1 = create_user(username="user1")
        user2 = create_user(username="user2")
        game = Game.objects.create(player_x=user1, mode="online", status="waiting")
        
        # User 2 joins
        from users.tokens import create_access_token
        token = create_access_token(user=user2)
        api_client.cookies['access_token'] = f"Bearer {token}"
        
        url = reverse('join_game')
        data = {"game_id": str(game.id)}
        response = api_client.post(url, data)
        
        assert response.status_code == status.HTTP_200_OK
        game.refresh_from_db()
        assert game.player_o == user2
        assert game.status == "active"

    def test_game_detail_api(self, auth_client):
        client, user = auth_client
        game = Game.objects.create(player_x=user, mode="local")
        
        url = reverse('game_detail', kwargs={'pk': game.id})
        response = client.get(url)
        
        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == str(game.id)

    def test_game_evaluation_api(self, auth_client):
        client, user = auth_client
        # Create a finished game to have evaluation
        game = Game.objects.create(player_x=user, mode="local", status="finished")
        
        url = reverse('game_evaluation', kwargs={'pk': game.id})
        response = client.get(url)
        
        # Note: If evaluation is not yet computed, it might return empty or 200 with default data
        # We just check the endpoint is accessible
        assert response.status_code == status.HTTP_200_OK

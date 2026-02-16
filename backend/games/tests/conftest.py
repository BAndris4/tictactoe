import pytest
from games.models import Game
from users.models import User

@pytest.fixture
def players(db):
    p1, _ = User.objects.get_or_create(username='p1')
    p1.set_password('password')
    p1.save()
    p2, _ = User.objects.get_or_create(username='p2')
    p2.set_password('password')
    p2.save()
    return p1, p2

@pytest.fixture
def game(db, players):
    p1, p2 = players
    return Game.objects.create(player_x=p1, player_o=p2, status='active', mode='local')

from django.urls import path
from .views import CreateGameView, JoinGameView, GameDetailView

urlpatterns = [
    path('create', CreateGameView.as_view(), name='create_game'),
    path('join', JoinGameView.as_view(), name='join_game'),
    path('<uuid:pk>', GameDetailView.as_view(), name='game_detail'),
]

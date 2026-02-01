from django.urls import path
from .views import (
    CreateGameView, JoinGameView, GameDetailView,
    ForfeitGameView, UserGameListView, BotStatsView,
    GameInvitationView, PendingGameInvitationsView, GameInvitationActionView
)

urlpatterns = [
    path('create/', CreateGameView.as_view(), name='create_game'),
    path('join/', JoinGameView.as_view(), name='join_game'),
    path('my-games/', UserGameListView.as_view(), name='user_game_list'),
    path('invitations/', GameInvitationView.as_view(), name='game_invitations'),
    path('invitations/pending/', PendingGameInvitationsView.as_view(), name='pending_game_invitations'),
    path('invitations/<int:pk>/', GameInvitationActionView.as_view(), name='game_invitation_action'),
    path('<uuid:pk>/', GameDetailView.as_view(), name='game_detail'),
    path('<uuid:pk>/forfeit/', ForfeitGameView.as_view(), name='forfeit_game'),
    path('bot-stats/', BotStatsView.as_view(), name='bot_stats'),
]

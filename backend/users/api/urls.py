from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, MeView,
    FriendRequestView, PendingFriendRequestsView,
    FriendRequestActionView, FriendsListView,
    UnfriendView, BlockUserView, UserProfileView, EmailCheckView, UsernameCheckView
)

urlpatterns = [
    path("register", RegisterView.as_view(), name="register"),
    path("check-email", EmailCheckView.as_view(), name="check-email"),
    path("check-username", UsernameCheckView.as_view(), name="check-username"),
    path("login", LoginView.as_view(), name="login"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("me", MeView.as_view(), name="me"),
    path("friends/request", FriendRequestView.as_view(), name="friend-request"),
    path("friends/requests/pending", PendingFriendRequestsView.as_view(), name="friend-requests-pending"),
    path("friends/requests/<int:pk>", FriendRequestActionView.as_view(), name="friend-request-action"),
    path("friends", FriendsListView.as_view(), name="friends-list"),
    path("friends/<str:username>", UnfriendView.as_view(), name="unfriend"),
    path("friends/block", BlockUserView.as_view(), name="block-user"),
    path("profile/<str:username>", UserProfileView.as_view(), name="user-profile"),
]

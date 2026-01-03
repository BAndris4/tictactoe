from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.AutoField(primary_key=True)

    phone_number = models.CharField(
        max_length=50,
        blank=True,
        null=True,
    )

    class Meta:
        db_table = "users"

    def __str__(self) -> str:
        return self.username

class FriendshipStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    ACCEPTED = 'accepted', 'Accepted'
    REJECTED = 'rejected', 'Rejected'
    BLOCKED = 'blocked', 'Blocked'

class Friendship(models.Model):
    from_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships_sent')
    to_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friendships_received')
    status = models.CharField(max_length=20, choices=FriendshipStatus.choices, default=FriendshipStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('from_user', 'to_user')
        db_table = "friendships"

    def __str__(self) -> str:
        return f"{self.from_user} -> {self.to_user} ({self.status})"

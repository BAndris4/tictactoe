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

class PlayerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='player_profile')
    level = models.IntegerField(default=1)
    current_xp = models.IntegerField(default=0)
    total_xp = models.IntegerField(default=0)
    
    # Ranked System
    mmr = models.IntegerField(null=True, blank=True, default=None)
    placement_games_played = models.IntegerField(default=0)
    total_lp = models.IntegerField(null=True, blank=True, default=None)
    current_streak = models.IntegerField(default=0) # positive for wins, negative for losses
    
    # Avatar System
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    avatar_config = models.JSONField(default=dict, blank=True)
    
    def __str__(self) -> str:
        return f"{self.user} (Lvl {self.level})"

    @property
    def can_play_ranked(self) -> bool:
        return self.level >= 10


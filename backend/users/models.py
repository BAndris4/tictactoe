from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid
from django.utils import timezone
from datetime import timedelta

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
    total_xp = models.IntegerField(default=0)
    
    # Ranked System
    mmr = models.IntegerField(null=True, blank=True, default=None)
    placement_games_played = models.IntegerField(default=0)
    total_lp = models.IntegerField(null=True, blank=True, default=None)
    current_streak = models.IntegerField(default=0) # positive for wins, negative for losses
    demotion_shield = models.IntegerField(default=0) # Number of games protected at 0 LP
    
    # Avatar System
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES, default='M')
    
    @property
    def can_play_ranked(self) -> bool:
        from .services.leveling import LevelingService
        return LevelingService.get_level_from_total_xp(self.total_xp) >= 10

    def get_avatar_config(self) -> dict:
        try:
            config = self.avatar_config
            return {
                "topType": config.top_type,
                "accessoriesType": config.accessories_type,
                "hairColor": config.hair_color,
                "facialHairType": config.facial_hair_type,
                "clotheType": config.clothe_type,
                "eyeType": config.eye_type,
                "eyebrowType": config.eyebrow_type,
                "mouthType": config.mouth_type,
                "skinColor": config.skin_color,
            }
        except Exception:
            return {}

    def __str__(self) -> str:
        from .services.leveling import LevelingService
        return f"{self.user} (Lvl {LevelingService.get_level_from_total_xp(self.total_xp)})"

class AvatarConfig(models.Model):
    player_profile = models.OneToOneField(PlayerProfile, on_delete=models.CASCADE, related_name='avatar_config')
    top_type = models.CharField(max_length=100)
    accessories_type = models.CharField(max_length=100)
    hair_color = models.CharField(max_length=100)
    facial_hair_type = models.CharField(max_length=100)
    clothe_type = models.CharField(max_length=100)
    eye_type = models.CharField(max_length=100)
    eyebrow_type = models.CharField(max_length=100)
    mouth_type = models.CharField(max_length=100)
    skin_color = models.CharField(max_length=100)

    def __str__(self) -> str:
        return f"Avatar for {self.player_profile.user.username}"

class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timedelta(hours=24)
        super().save(*args, **kwargs)

    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at

    class Meta:
        db_table = "password_reset_tokens"

    def __str__(self) -> str:
        return f"Reset token for {self.user.email}"


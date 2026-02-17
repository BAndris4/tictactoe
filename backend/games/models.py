from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
import uuid

class GameMode(models.TextChoices):
    AI = 'ai', _('AI')
    BOT_EASY = 'bot_easy', _('Bot Easy')
    BOT_MEDIUM = 'bot_medium', _('Bot Medium')
    BOT_HARD = 'bot_hard', _('Bot Hard')
    LOCAL = 'local', _('Local')
    CUSTOM = 'custom', _('Custom')
    BOT_CUSTOM = 'bot_custom', _('Bot Custom')
    UNRANKED = 'unranked', _('Unranked')
    RANKED = 'ranked', _('Ranked')

class GameStatus(models.TextChoices):
    WAITING = 'waiting', _('Waiting')
    ACTIVE = 'active', _('Active')
    FINISHED = 'finished', _('Finished')
    ABORTED = 'aborted', _('Aborted')

class Game(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    mode = models.CharField(max_length=10, choices=GameMode.choices)
    status = models.CharField(max_length=10, choices=GameStatus.choices, default=GameStatus.WAITING)
    rated = models.BooleanField(default=False)
    winner = models.CharField(max_length=1, null=True, blank=True, help_text="X, O, or D")
    
    player_x = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='games_as_x')
    player_o = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, related_name='games_as_o')

    bot_difficulty = models.IntegerField(default=0, help_text="0-100, probability of random move (for custom bot)")
    
    player_x_xp_gained = models.IntegerField(null=True, blank=True)
    player_o_xp_gained = models.IntegerField(null=True, blank=True)
    
    player_x_mmr_change = models.IntegerField(null=True, blank=True)
    player_o_mmr_change = models.IntegerField(null=True, blank=True)
    player_x_lp_change = models.IntegerField(null=True, blank=True)
    player_o_lp_change = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    finished_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

class GameMove(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='moves')
    move_no = models.IntegerField()
    player = models.CharField(max_length=1)
    cell = models.IntegerField(help_text="0-8")
    subcell = models.IntegerField(help_text="0-8")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('game', 'move_no')
        ordering = ['move_no']
class GameInvitationStatus(models.TextChoices):
    PENDING = 'pending', _('Pending')
    ACCEPTED = 'accepted', _('Accepted')
    REJECTED = 'rejected', _('Rejected')

class GameInvitation(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='invitations')
    from_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_game_invites')
    to_user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='received_game_invites')
    status = models.CharField(max_length=10, choices=GameInvitationStatus.choices, default=GameInvitationStatus.PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('game', 'to_user')
        ordering = ['-created_at']

class ChatMessage(models.Model):
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='chat_messages')
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    sender_name = models.CharField(max_length=100, blank=True, null=True) # For bots or fallback
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_bot = models.BooleanField(default=False)
    message_type = models.CharField(max_length=20, default='chat', choices=[('chat', 'Chat'), ('evaluation', 'Evaluation')])

    def __str__(self):
        return f"{self.sender_name} ({self.message_type}): {self.content[:20]}"

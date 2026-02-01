from rest_framework import serializers
from .models import Game, GameMove, GameMode, GameStatus, GameInvitation

class GameInvitationSerializer(serializers.ModelSerializer):
    from_user_name = serializers.ReadOnlyField(source='from_user.username')
    to_user_name = serializers.ReadOnlyField(source='to_user.username')
    from_user_avatar = serializers.SerializerMethodField()
    to_user_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = GameInvitation
        fields = ['id', 'game', 'from_user', 'from_user_name', 'from_user_avatar', 'to_user', 'to_user_name', 'to_user_avatar', 'status', 'created_at']
        read_only_fields = ['id', 'from_user', 'status', 'created_at']

    def get_from_user_avatar(self, obj):
        from users.models import PlayerProfile
        profile, _ = PlayerProfile.objects.get_or_create(user=obj.from_user)
        return profile.avatar_config

    def get_to_user_avatar(self, obj):
        from users.models import PlayerProfile
        profile, _ = PlayerProfile.objects.get_or_create(user=obj.to_user)
        return profile.avatar_config

class CreateGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'mode']
        read_only_fields = ['id']

class JoinGameSerializer(serializers.Serializer):
    game_id = serializers.UUIDField()

class GameMoveSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameMove
        fields = ['move_no', 'player', 'cell', 'subcell', 'created_at']

class GameSerializer(serializers.ModelSerializer):
    moves = GameMoveSerializer(many=True, read_only=True)
    player_x_name = serializers.SerializerMethodField()
    player_o_name = serializers.SerializerMethodField()
    player_x_avatar = serializers.SerializerMethodField()
    player_o_avatar = serializers.SerializerMethodField()
    
    class Meta:
        model = Game
        fields = [
            'id', 'mode', 'status', 'rated', 
            'player_x', 'player_o',
            'player_x_name', 'player_o_name',
            'player_x_avatar', 'player_o_avatar',
            'current_turn', 'next_board_constraint', 
            'winner', 'moves', 'created_at',
            'player_x_xp_gained', 'player_o_xp_gained',
            'player_x_mmr_change', 'player_o_mmr_change',
            'player_x_lp_change', 'player_o_lp_change'
        ]

    def get_player_x_name(self, obj):
        if obj.mode == 'local' and obj.player_x:
            return f"{obj.player_x.username} (X)"
        if obj.mode == 'bot_easy' and not obj.player_x:
            return "Tiny Bot (Easy)"
        if obj.mode == 'bot_medium' and not obj.player_x:
             return "Beta Unit (Medium)"
        if obj.mode == 'bot_hard' and not obj.player_x:
             return "Omega AI (Hard)"
        return obj.player_x.username if obj.player_x else None

    def get_player_o_name(self, obj):
        if obj.mode == 'local' and obj.player_x:
            # In local mode, player_x plays both sides, so we use player_x's name for O too
            return f"{obj.player_x.username} (O)"
        if obj.mode == 'bot_easy' and not obj.player_o:
            return "Tiny Bot (Easy)"
        if obj.mode == 'bot_medium' and not obj.player_o:
             return "Beta Unit (Medium)"
        if obj.mode == 'bot_hard' and not obj.player_o:
             return "Omega AI (Hard)"
        return obj.player_o.username if obj.player_o else None

    def get_player_x_avatar(self, obj):
        if not obj.player_x: return None
        from users.models import PlayerProfile
        profile, _ = PlayerProfile.objects.get_or_create(user=obj.player_x)
        return profile.avatar_config

    def get_player_o_avatar(self, obj):
        if not obj.player_o: return None
        from users.models import PlayerProfile
        profile, _ = PlayerProfile.objects.get_or_create(user=obj.player_o)
        return profile.avatar_config

from rest_framework import serializers
from .models import Game, GameMove, GameMode, GameStatus, GameInvitation

class GameInvitationSerializer(serializers.ModelSerializer):
    from_user_name = serializers.ReadOnlyField(source='from_user.username')
    to_user_name = serializers.ReadOnlyField(source='to_user.username')
    
    class Meta:
        model = GameInvitation
        fields = ['id', 'game', 'from_user', 'from_user_name', 'to_user', 'to_user_name', 'status', 'created_at']
        read_only_fields = ['id', 'from_user', 'status', 'created_at']

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
    
    class Meta:
        model = Game
        fields = [
            'id', 'mode', 'status', 'rated', 
            'player_x', 'player_o',
            'player_x_name', 'player_o_name',
            'current_turn', 'next_board_constraint', 
            'winner', 'moves', 'created_at'
        ]

    def get_player_x_name(self, obj):
        if obj.mode == 'local' and obj.player_x:
            return f"{obj.player_x.username} (X)"
        return obj.player_x.username if obj.player_x else None

    def get_player_o_name(self, obj):
        if obj.mode == 'local' and obj.player_x:
            # In local mode, player_x plays both sides, so we use player_x's name for O too
            return f"{obj.player_x.username} (O)"
        return obj.player_o.username if obj.player_o else None

from rest_framework import serializers
from .models import Game, GameMove, GameMode, GameStatus

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
    player_x_name = serializers.ReadOnlyField(source='player_x.username')
    player_o_name = serializers.ReadOnlyField(source='player_o.username')
    
    class Meta:
        model = Game
        fields = [
            'id', 'mode', 'status', 'rated', 
            'player_x', 'player_o',
            'player_x_name', 'player_o_name',
            'current_turn', 'next_board_constraint', 
            'winner', 'moves'
        ]

from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Game, GameStatus, GameMode
from .serializers import CreateGameSerializer, JoinGameSerializer, GameSerializer
from .auth_utils import get_user_from_request
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.utils import timezone

class CreateGameView(APIView):
    permission_classes = [] # Manual handling

    def post(self, request):
        user, error_response = get_user_from_request(request)
        if error_response:
            return error_response

        serializer = CreateGameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        mode = serializer.validated_data.get('mode', GameMode.ONLINE)
        
        # Determine status
        status_val = GameStatus.WAITING
        if mode == GameMode.LOCAL:
            status_val = GameStatus.ACTIVE

        game = Game.objects.create(
            mode=mode,
            player_x=user,
            status=status_val
        )
        return Response(CreateGameSerializer(game).data, status=status.HTTP_201_CREATED)

class JoinGameView(APIView):
    permission_classes = [] # Manual handling

    def post(self, request):
        user, error_response = get_user_from_request(request)
        if error_response:
            return error_response

        serializer = JoinGameSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        game_id = serializer.validated_data['game_id']
        
        game = get_object_or_404(Game, id=game_id)
        
        if game.status != GameStatus.WAITING:
            return Response({"error": "Game is not waiting for players"}, status=status.HTTP_400_BAD_REQUEST)
        
        if game.player_x == user:
             return Response({"error": "You are already in this game"}, status=status.HTTP_400_BAD_REQUEST)

        game.player_o = user
        game.status = GameStatus.ACTIVE
        game.save()
        
        # Notify players via WebSocket
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'game_{game.id}',
            {
                'type': 'game_update',
                'data': {
                    'type': 'game_started',
                    'player_o_id': str(user.id),
                    'player_o_name': user.username
                }
            }
        )
        
        return Response(GameSerializer(game).data)

class GameDetailView(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    permission_classes = [] # Manual handling

    def get(self, request, *args, **kwargs):
        user, error_response = get_user_from_request(request)
        if error_response:
            return error_response
        return super().get(request, *args, **kwargs)

class ForfeitGameView(APIView):
    permission_classes = [] 

    def post(self, request, pk):
        user, error_response = get_user_from_request(request)
        if error_response:
            return error_response
        
        game = get_object_or_404(Game, id=pk)
        
        if game.status == GameStatus.WAITING:
            game.status = GameStatus.ABORTED
            game.save()
            
            # Notify via WebSocket if anyone is listening
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'game_{game.id}',
                {
                    'type': 'game_update',
                    'data': {
                        'type': 'game_aborted',
                        'reason': 'player_left'
                    }
                }
            )
            return Response(GameSerializer(game).data)

        if game.status in [GameStatus.FINISHED, GameStatus.ABORTED]:
            return Response(GameSerializer(game).data)

        if game.status != GameStatus.ACTIVE:
             return Response({"error": "Game is not active"}, status=status.HTTP_400_BAD_REQUEST)
            
        # If it's a local game, we abort it instead of finishing with a winner
        if game.mode == GameMode.LOCAL:
            game.status = GameStatus.ABORTED
            game.save()
            
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'game_{game.id}',
                {
                    'type': 'game_update',
                    'data': {
                        'type': 'game_aborted',
                        'reason': 'local_exit'
                    }
                }
            )
            return Response(GameSerializer(game).data)

        winner_symbol = None
        if game.player_x == user:
            winner_symbol = 'O'
        elif game.player_o == user:
            winner_symbol = 'X'
        else:
             return Response({"error": "You are not a player in this game"}, status=status.HTTP_403_FORBIDDEN)
             
        game.status = GameStatus.FINISHED
        game.winner = winner_symbol
        game.finished_at = timezone.now()
        game.save()
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'game_{game.id}',
            {
                'type': 'game_update',
                'data': {
                    'type': 'game_over',
                    'winner': winner_symbol,
                    'reason': 'forfeit'
                }
            }
        )
        
        return Response(GameSerializer(game).data)

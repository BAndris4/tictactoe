from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Game, GameStatus, GameMode, GameInvitation, GameInvitationStatus
from .serializers import CreateGameSerializer, JoinGameSerializer, GameSerializer, GameInvitationSerializer

class GameInvitationView(APIView):
    def post(self, request):
        user, error_response = get_user_from_request(request)
        if error_response:
            return error_response
            
        serializer = GameInvitationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        to_user = serializer.validated_data['to_user']
        game = serializer.validated_data['game']
        
        if game.player_x != user:
            return Response({"error": "Only the game creator can invite players"}, status=status.HTTP_403_FORBIDDEN)
            
        if game.status != GameStatus.WAITING:
            return Response({"error": "Game is already in progress or finished"}, status=status.HTTP_400_BAD_REQUEST)

        invitation, created = GameInvitation.objects.get_or_create(
            game=game,
            to_user=to_user,
            defaults={'from_user': user}
        )
        
        if not created:
             invitation.status = GameInvitationStatus.PENDING
             invitation.save()
             
        return Response(GameInvitationSerializer(invitation).data, status=status.HTTP_201_CREATED)

class PendingGameInvitationsView(generics.ListAPIView):
    serializer_class = GameInvitationSerializer
    
    def get_queryset(self):
        user, error_response = get_user_from_request(self.request)
        if error_response:
            return GameInvitation.objects.none()
        return GameInvitation.objects.filter(to_user=user, status=GameInvitationStatus.PENDING)

class GameInvitationActionView(APIView):
    def patch(self, request, pk):
        user, error_response = get_user_from_request(request)
        if error_response:
            return error_response
            
        invitation = get_object_or_404(GameInvitation, id=pk, to_user=user)
        action = request.data.get('action')
        
        if action == 'accepted':
            invitation.status = GameInvitationStatus.ACCEPTED
            invitation.save()
            
            # Auto-join the game
            game = invitation.game
            if game.status == GameStatus.ABORTED:
                return Response({"error": "This game has been cancelled by the creator."}, status=status.HTTP_400_BAD_REQUEST)
            
            if game.status == GameStatus.WAITING:
                game.player_o = user
                game.status = GameStatus.ACTIVE
                game.save()
                
                # Notify via WebSocket
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
            return Response(GameInvitationSerializer(invitation).data)
            
        elif action == 'rejected':
            invitation.status = GameInvitationStatus.REJECTED
            invitation.save()
            
            # Notify the creator via WebSocket
            channel_layer = get_channel_layer()
            async_to_sync(channel_layer.group_send)(
                f'game_{invitation.game.id}',
                {
                    'type': 'game_update',
                    'data': {
                        'type': 'game_invitation_rejected',
                        'user': user.username
                    }
                }
            )
            return Response(GameInvitationSerializer(invitation).data)
            
        return Response({"error": "Invalid action"}, status=status.HTTP_400_BAD_REQUEST)
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
        
        mode = serializer.validated_data.get('mode', GameMode.CUSTOM)
        
        # Determine status
        status_val = GameStatus.WAITING
        if mode == GameMode.LOCAL:
            status_val = GameStatus.ACTIVE
        
        player_x = user
        player_o = None
        
        if mode in [GameMode.BOT_EASY, GameMode.BOT_MEDIUM, GameMode.BOT_HARD]:
            import random
            status_val = GameStatus.ACTIVE
            if random.choice([True, False]):
                # User is X
                player_x = user
                player_o = None
            else:
                # User is O, Bot is X
                player_x = None
                player_o = user

        game = Game.objects.create(
            mode=mode,
            player_x=player_x,
            player_o=player_o,
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
        
        if game.status == GameStatus.ABORTED:
            return Response({"error": "This game has been cancelled."}, status=status.HTTP_400_BAD_REQUEST)

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
            # Notify all invited users specifically via their notification channel
            channel_layer = get_channel_layer()
            pending_invites = GameInvitation.objects.filter(game=game, status=GameInvitationStatus.PENDING)
            for invite in pending_invites:
                async_to_sync(channel_layer.group_send)(
                    f'user_notifications_{invite.to_user.id}',
                    {
                        'type': 'send_notification',
                        'data': {
                            'type': 'game_invitation_cancelled',
                            'game_id': str(game.id),
                            'from_user': user.username
                        }
                    }
                )
            
            # Delete the game and cascade-delete invitations
            game_data = GameSerializer(game).data # Capture data before deletion
            game.delete()
            return Response(game_data)

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
        
        # Calculate XP
        from users.services import LevelingService
        xp_results = LevelingService.process_game_end(game)
        
        # Calculate Ranking (MMR & LP)
        from users.ranking_service import RankingService
        ranking_results = RankingService.process_game_end(game)
        mmr_results = ranking_results.get('mmr', {})
        lp_results = ranking_results.get('lp', {})
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'game_{game.id}',
            {
                'type': 'game_update',
                'data': {
                    'type': 'game_over',
                    'mode': game.mode,
                    'winner': winner_symbol,
                    'reason': 'forfeit',
                    'xp_results': xp_results,
                    'mmr_results': mmr_results,
                    'lp_results': lp_results,
                    'ranks': ranking_results.get('ranks', {})
                }
            }
        )
        
        return Response(GameSerializer(game).data)

class UserGameListView(generics.ListAPIView):
    serializer_class = GameSerializer
    permission_classes = [] # Manual handling

    def get_queryset(self):
        user, error_response = get_user_from_request(self.request)
        if error_response:
            return Game.objects.none()
        
        from django.db.models import Q
        return Game.objects.filter(
            Q(player_x=user) | Q(player_o=user)
        ).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        user, error_response = get_user_from_request(request)
        if error_response:
            return error_response
        return super().list(request, *args, **kwargs)

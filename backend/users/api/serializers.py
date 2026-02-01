from rest_framework import serializers
from django.contrib.auth import get_user_model
from ..models import Friendship, FriendshipStatus

User = get_user_model()


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=150, required=False, allow_blank=True)
    phone_number = serializers.CharField(max_length=50, required=False, allow_blank=True)


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "profile"
        ]

    def get_profile(self, obj):
        # Ensure profile exists
        from ..models import PlayerProfile
        from ..services import LevelingService
        profile, _ = PlayerProfile.objects.get_or_create(user=obj)
        
        from ..ranking_service import RankingService
        
        if profile.total_lp is None:
            rank_name = "Unranked"
            lp_in_division = 0
            total_lp = 0
        else:
            rank_name, lp_in_division = RankingService.get_rank_from_lp(profile.total_lp)
            total_lp = profile.total_lp
        
        return {
            "level": profile.level,
            "current_xp": profile.current_xp,
            "next_level_xp": LevelingService.get_xp_required_for_level(profile.level),
            "mmr": profile.mmr, # Can be None
            "placement_games_played": profile.placement_games_played,
            "total_lp": total_lp,
            "rank": rank_name,
            "lp_in_division": lp_in_division
        }

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    stay_logged_in = serializers.BooleanField(required=False, default=False)

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = serializers.StringRelatedField()
    to_user = serializers.StringRelatedField()
    
    class Meta:
        model = Friendship
        fields = ['id', 'from_user', 'to_user', 'status', 'created_at']

class FriendRequestActionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[FriendshipStatus.ACCEPTED, FriendshipStatus.REJECTED])


class PublicUserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    stats = serializers.SerializerMethodField()
    mutual_friends = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "profile",
            "stats",
            "mutual_friends"
        ]

    def get_profile(self, obj):
        from ..models import PlayerProfile
        from ..services import LevelingService
        from ..ranking_service import RankingService
        
        profile, _ = PlayerProfile.objects.get_or_create(user=obj)
        
        if profile.total_lp is None:
            rank_name = "Unranked"
            lp_in_division = 0
            total_lp = 0
        else:
            rank_name, lp_in_division = RankingService.get_rank_from_lp(profile.total_lp)
            total_lp = profile.total_lp
        
        return {
            "level": profile.level,
            "current_xp": profile.current_xp,
            "next_level_xp": LevelingService.get_xp_required_for_level(profile.level),
            "total_lp": total_lp,
            "lp_in_division": lp_in_division,
            "rank": rank_name,
        }

    def get_stats(self, obj):
        from games.models import Game, GameStatus, GameMode
        from django.db.models import Q
        
        games_played_count = Game.objects.filter(
            (Q(player_x=obj) | Q(player_o=obj)),
            status=GameStatus.FINISHED
        ).count()
        
        unrated_games = Game.objects.filter(
            (Q(player_x=obj) | Q(player_o=obj)),
            status=GameStatus.FINISHED,
            rated=False
        )
        
        wins = 0
        losses = 0
        draws = 0

        unrated_played = unrated_games.count()
        
        if unrated_played > 0:
            for g in unrated_games:
                if g.winner == 'D':
                    draws += 1
                    continue
                
                if (g.winner == 'X' and g.player_x == obj) or \
                   (g.winner == 'O' and g.player_o == obj):
                    wins += 1
                else:
                    losses += 1
            
            winrate = (wins / unrated_played) * 100
        else:
            winrate = 0.0

        return {
            "total_games_played": games_played_count,
            "unrated_winrate": round(winrate, 1),
            "unrated_wins": wins,
            "unrated_losses": losses,
            "unrated_draws": draws
        }

    def get_mutual_friends(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return []
            
        if request.user == obj:
            return []

        from ..selectors import get_friends_list
        my_friends = set(get_friends_list(request.user))
        their_friends = set(get_friends_list(obj))
        
        mutual = my_friends.intersection(their_friends)
        
        return [u.username for u in mutual]



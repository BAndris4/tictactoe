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
    gender = serializers.ChoiceField(choices=['M', 'F'], default='M')
    avatar_config = serializers.JSONField(required=False)


class UserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()

    avatar_config = serializers.JSONField(required=False, write_only=True)
    gender = serializers.ChoiceField(choices=['M', 'F'], required=False, write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "last_name",
            "phone_number",
            "profile",
            "avatar_config",
            "gender"
        ]

    def update(self, instance, validated_data):
        avatar_data = validated_data.pop('avatar_config', None)
        gender = validated_data.pop('gender', None)
        instance = super().update(instance, validated_data)
        
        if avatar_data is not None or gender is not None:
             from ..models import PlayerProfile, AvatarConfig
             profile, _ = PlayerProfile.objects.get_or_create(user=instance)
             if gender is not None:
                 profile.gender = gender
                 profile.save()
             
             if avatar_data is not None:
                 avatar_config, _ = AvatarConfig.objects.get_or_create(player_profile=profile)
                 avatar_config.top_type = avatar_data.get('topType', avatar_config.top_type)
                 avatar_config.accessories_type = avatar_data.get('accessoriesType', avatar_config.accessories_type)
                 avatar_config.hair_color = avatar_data.get('hairColor', avatar_config.hair_color)
                 avatar_config.facial_hair_type = avatar_data.get('facialHairType', avatar_config.facial_hair_type)
                 avatar_config.clothe_type = avatar_data.get('clotheType', avatar_config.clothe_type)
                 avatar_config.eye_type = avatar_data.get('eyeType', avatar_config.eye_type)
                 avatar_config.eyebrow_type = avatar_data.get('eyebrowType', avatar_config.eyebrow_type)
                 avatar_config.mouth_type = avatar_data.get('mouthType', avatar_config.mouth_type)
                 avatar_config.skin_color = avatar_data.get('skinColor', avatar_config.skin_color)
                 avatar_config.save()
        
        return instance

    def get_profile(self, obj):
        from ..models import PlayerProfile
        from ..services import LevelingService
        from ..services import RankingService
        
        profile, _ = PlayerProfile.objects.get_or_create(user=obj)
        level = LevelingService.get_level_from_total_xp(profile.total_xp)
        current_xp = LevelingService.get_xp_in_level_from_total_xp(profile.total_xp)
        
        if profile.total_lp is None:
            rank_name = "Unranked"
            lp_in_division = 0
            total_lp = 0
        else:
            rank_name, lp_in_division = RankingService.get_rank_from_lp(profile.total_lp)
            total_lp = profile.total_lp
        
        return {
            "level": level,
            "current_xp": current_xp,
            "next_level_xp": LevelingService.get_xp_required_for_level(level),
            "mmr": profile.mmr, # Can be None
            "placement_games_played": profile.placement_games_played,
            "total_lp": total_lp,
            "rank": rank_name,
            "lp_in_division": lp_in_division,
            "gender": profile.gender,
            "avatar_config": profile.get_avatar_config(),
            "demotion_shield": profile.demotion_shield,
            "current_streak": profile.current_streak
        }


class SimpleUserSerializer(serializers.ModelSerializer):
    profile = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ["username", "profile"]

    def get_profile(self, obj):
        from ..models import PlayerProfile
        profile, _ = PlayerProfile.objects.get_or_create(user=obj)
        
        return {
            "avatar_config": profile.get_avatar_config(),
            "gender": profile.gender,
        }

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    stay_logged_in = serializers.BooleanField(required=False, default=False)

class FriendshipSerializer(serializers.ModelSerializer):
    from_user = SimpleUserSerializer(read_only=True)
    to_user = SimpleUserSerializer(read_only=True)
    
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
        from ..services import RankingService
        
        profile, _ = PlayerProfile.objects.get_or_create(user=obj)
        level = LevelingService.get_level_from_total_xp(profile.total_xp)
        current_xp = LevelingService.get_xp_in_level_from_total_xp(profile.total_xp)
        
        if profile.total_lp is None:
            rank_name = "Unranked"
            lp_in_division = 0
            total_lp = 0
        else:
            rank_name, lp_in_division = RankingService.get_rank_from_lp(profile.total_lp)
            total_lp = profile.total_lp
        
        return {
            "level": level,
            "current_xp": current_xp,
            "next_level_xp": LevelingService.get_xp_required_for_level(level),
            "total_lp": total_lp,
            "lp_in_division": lp_in_division,
            "rank": rank_name,
            "gender": profile.gender,
            "avatar_config": profile.get_avatar_config(),
            "demotion_shield": profile.demotion_shield,
            "current_streak": profile.current_streak
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
            from games.logic import GameLogic
            for g in unrated_games:
                g_winner = GameLogic.get_winner(g.id)
                if g_winner == 'D':
                    draws += 1
                    continue
                
                if (g_winner == 'X' and g.player_x == obj) or \
                   (g_winner == 'O' and g.player_o == obj):
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



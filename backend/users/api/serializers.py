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


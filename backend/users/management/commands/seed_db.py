from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from users.models import PlayerProfile
from games.models import Game, GameMode, GameStatus
import random

User = get_user_model()

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding database...')

        # 1. Create Users
        users_data = [
            {'username': 'admin', 'email': 'admin@example.com', 'is_superuser': True, 'is_staff': True},
            {'username': 'player1', 'email': 'p1@example.com'},
            {'username': 'player2', 'email': 'p2@example.com'},
            {'username': 'pro_gamer', 'email': 'pro@example.com'},
        ]

        created_users = []
        for u_data in users_data:
            user, created = User.objects.get_or_create(
                username=u_data['username'],
                defaults={
                    'email': u_data['email'],
                    'is_superuser': u_data.get('is_superuser', False),
                    'is_staff': u_data.get('is_staff', False),
                }
            )
            if created:
                user.set_password('adminpassword')
                user.save()
                self.stdout.write(f'User {user.username} created')
            
            # Ensure PlayerProfile exists
            profile, p_created = PlayerProfile.objects.get_or_create(user=user)
            if p_created:
                profile.level = random.randint(1, 25)
                profile.mmr = random.randint(800, 2000)
                profile.save()
                self.stdout.write(f'Profile for {user.username} created')
            
            created_users.append(user)

        # 2. Create Sample Games
        if len(created_users) >= 2:
            p1 = created_users[1] # player1
            p2 = created_users[2] # player2
            
            # Active local game
            Game.objects.get_or_create(
                player_x=p1,
                player_o=p2,
                mode=GameMode.LOCAL,
                status=GameStatus.ACTIVE,
                defaults={'current_turn': 'X', 'move_count': 0}
            )
            
            # Finished ranked game
            finished_game, f_created = Game.objects.get_or_create(
                player_x=p1,
                player_o=p2,
                mode=GameMode.RANKED,
                status=GameStatus.FINISHED,
                defaults={'winner': 'X', 'move_count': 45}
            )
            if f_created:
                self.stdout.write('Finished game created')

        self.stdout.write(self.style.SUCCESS('Successfully seeded database'))

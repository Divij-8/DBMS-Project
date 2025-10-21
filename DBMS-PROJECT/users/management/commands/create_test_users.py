from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for development'

    def handle(self, *args, **options):
        test_users = [
            {
                'username': 'farmer_test',
                'email': 'farmer@test.com',
                'password': 'TestPassword123!',
                'role': 'farmer',
                'first_name': 'John',
                'last_name': 'Farmer',
                'phone': '+91-9876543210',
                'location': 'Maharashtra, India',
                'farm_size': 50.00,
            },
            {
                'username': 'buyer_test',
                'email': 'buyer@test.com',
                'password': 'TestPassword123!',
                'role': 'buyer',
                'first_name': 'Jane',
                'last_name': 'Buyer',
                'phone': '+91-9876543211',
                'location': 'Delhi, India',
                'farm_size': None,
            },
            {
                'username': 'admin_test',
                'email': 'admin@test.com',
                'password': 'AdminPassword123!',
                'role': 'admin',
                'first_name': 'Admin',
                'last_name': 'User',
                'phone': '+91-9876543212',
                'location': 'Bangalore, India',
                'farm_size': None,
            },
        ]

        for user_data in test_users:
            password = user_data.pop('password')
            username = user_data.get('username')
            
            # Check if user already exists
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.WARNING(f'User {username} already exists'))
                continue
            
            # Create user
            user = User.objects.create_user(password=password, **user_data)
            self.stdout.write(self.style.SUCCESS(f'Successfully created user: {username}'))
            self.stdout.write(f'  Email: {user.email}')
            self.stdout.write(f'  Role: {user.role}')

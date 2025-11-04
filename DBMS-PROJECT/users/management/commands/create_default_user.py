from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a default superuser if it does not exist'

    def add_arguments(self, parser):
        parser.add_argument('--username', type=str, default='divij', help='Username for superuser')
        parser.add_argument('--email', type=str, default='divij@example.com', help='Email for superuser')
        parser.add_argument('--password', type=str, default='password123', help='Password for superuser')
        parser.add_argument('--role', type=str, default='farmer', help='Role for superuser (farmer/buyer/admin)')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        role = options['role']

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f'User "{username}" already exists'))
            return

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password
        )
        user.role = role
        user.save()

        self.stdout.write(self.style.SUCCESS(f'✓ Superuser "{username}" created successfully'))
        self.stdout.write(f'  Email: {email}')
        self.stdout.write(f'  Role: {role}')
        self.stdout.write(f'  Password: {password}')

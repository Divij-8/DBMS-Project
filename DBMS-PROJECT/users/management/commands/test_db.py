from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings

class Command(BaseCommand):
    help = 'Test database connection and display configuration'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Database Connection Test'))
        self.stdout.write('=' * 50)
        
        # Display database settings
        db_config = settings.DATABASES['default']
        self.stdout.write(f"Engine: {db_config.get('ENGINE')}")
        self.stdout.write(f"Host: {db_config.get('HOST')}")
        self.stdout.write(f"Port: {db_config.get('PORT')}")
        self.stdout.write(f"Name: {db_config.get('NAME')}")
        self.stdout.write(f"User: {db_config.get('USER')}")
        
        try:
            with connection.cursor() as cursor:
                cursor.execute('SELECT 1')
            self.stdout.write(self.style.SUCCESS('✓ Database connection successful!'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Database connection failed: {str(e)}'))

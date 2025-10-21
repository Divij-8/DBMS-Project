from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from marketplace.models import Product
from datetime import date

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample products for testing the marketplace'

    def handle(self, *args, **options):
        # Get the farmer user
        try:
            farmer = User.objects.get(username='farmer_test')
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Farmer test user not found. Please run create_test_users first.'))
            return

        sample_products = [
            {
                'name': 'Organic Tomatoes',
                'description': 'Fresh organic tomatoes, vine-ripened and pesticide-free',
                'category': 'vegetables',
                'price': 80.00,
                'unit': 'kg',
                'quantity': 100.00,
                'location': 'Maharashtra, India',
                'harvest_date': date.today(),
            },
            {
                'name': 'Fresh Lettuce',
                'description': 'Crisp romaine lettuce, grown using sustainable farming practices',
                'category': 'vegetables',
                'price': 45.00,
                'unit': 'heads',
                'quantity': 50.00,
                'location': 'Maharashtra, India',
                'harvest_date': date.today(),
            },
            {
                'name': 'Organic Carrots',
                'description': 'Sweet and crunchy organic carrots, perfect for cooking or eating raw',
                'category': 'vegetables',
                'price': 60.00,
                'unit': 'kg',
                'quantity': 75.00,
                'location': 'Maharashtra, India',
                'harvest_date': date.today(),
            },
            {
                'name': 'Fresh Mangoes',
                'description': 'Sweet and juicy Alphonso mangoes, harvested at peak ripeness',
                'category': 'fruits',
                'price': 120.00,
                'unit': 'kg',
                'quantity': 30.00,
                'location': 'Maharashtra, India',
                'harvest_date': date.today(),
            },
            {
                'name': 'Organic Rice',
                'description': 'Premium quality organic basmati rice, grown without chemicals',
                'category': 'grains',
                'price': 95.00,
                'unit': 'kg',
                'quantity': 200.00,
                'location': 'Maharashtra, India',
                'harvest_date': date.today(),
            },
        ]

        for product_data in sample_products:
            # Check if product already exists
            if Product.objects.filter(name=product_data['name'], seller=farmer).exists():
                self.stdout.write(self.style.WARNING(f'Product {product_data["name"]} already exists'))
                continue

            # Create product
            product = Product.objects.create(seller=farmer, **product_data)
            self.stdout.write(self.style.SUCCESS(f'Successfully created product: {product.name}'))

        self.stdout.write(self.style.SUCCESS(f'Created {len(sample_products)} sample products'))
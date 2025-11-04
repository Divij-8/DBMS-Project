from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from marketplace.models import Product, Equipment
from farm_data.models import FarmData
from datetime import datetime, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Seed database with test data for divij, jayanth, and kiran'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database seeding...'))
        
        # Create users
        users_data = [
            {
                'username': 'divij',
                'email': 'divij@example.com',
                'password': 'divij123',
                'role': 'farmer',
                'phone': '9876543210',
                'location': 'Bangalore, Karnataka'
            },
            {
                'username': 'jayanth',
                'email': 'jayanth@example.com',
                'password': 'jayanth123',
                'role': 'farmer',
                'phone': '9876543211',
                'location': 'Mysore, Karnataka'
            },
            {
                'username': 'kiran',
                'email': 'kiran@example.com',
                'password': 'kiran123',
                'role': 'buyer',
                'phone': '9876543212',
                'location': 'Bangalore, Karnataka'
            }
        ]
        
        created_users = {}
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                username=user_data['username'],
                defaults={
                    'email': user_data['email'],
                    'role': user_data['role'],
                    'phone': user_data['phone'],
                    'location': user_data['location'],
                }
            )
            
            if created:
                user.set_password(user_data['password'])
                user.save()
                self.stdout.write(self.style.SUCCESS(f"✓ Created user: {user_data['username']}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠ User already exists: {user_data['username']}"))
            
            created_users[user_data['username']] = user
        
        # Create farm data for farmers
        farm_data_list = [
            {
                'username': 'divij',
                'crop_type': 'Tomato',
                'soil_type': 'loamy',
                'irrigation_type': 'drip',
                'area': 50.5,
            },
            {
                'username': 'divij',
                'crop_type': 'Lettuce',
                'soil_type': 'loamy',
                'irrigation_type': 'sprinkler',
                'area': 20.0,
            },
            {
                'username': 'jayanth',
                'crop_type': 'Rice',
                'soil_type': 'clay',
                'irrigation_type': 'surface',
                'area': 75.0,
            },
            {
                'username': 'jayanth',
                'crop_type': 'Sugarcane',
                'soil_type': 'loamy',
                'irrigation_type': 'drip',
                'area': 30.0,
            }
        ]
        
        for farm_data in farm_data_list:
            user = created_users[farm_data['username']]
            today = datetime.now().date()
            
            fd, created = FarmData.objects.get_or_create(
                user=user,
                crop_type=farm_data['crop_type'],
                planting_date=today - timedelta(days=60),
                defaults={
                    'expected_harvest': today + timedelta(days=30),
                    'area': farm_data['area'],
                    'soil_type': farm_data['soil_type'],
                    'irrigation_type': farm_data['irrigation_type'],
                    'notes': f"{farm_data['crop_type']} farm data for {user.username}"
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"✓ Created farm data: {farm_data['crop_type']} for {user.username}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠ Farm data already exists: {farm_data['crop_type']} for {user.username}"))
        
        # Create products
        products_data = [
            {
                'seller': 'divij',
                'name': 'Fresh Tomatoes',
                'category': 'vegetables',
                'price': 50.00,
                'unit': 'kg',
                'quantity': 100,
                'description': 'Fresh, locally grown tomatoes. Perfect for cooking and salads.',
                'location': 'Whitefield, Bangalore',
                'harvest_date': datetime.now().date(),
            },
            {
                'seller': 'divij',
                'name': 'Organic Lettuce',
                'category': 'vegetables',
                'price': 80.00,
                'unit': 'kg',
                'quantity': 50,
                'description': 'Crisp and fresh organic lettuce from our farm.',
                'location': 'Whitefield, Bangalore',
                'harvest_date': datetime.now().date(),
            },
            {
                'seller': 'divij',
                'name': 'Carrots',
                'category': 'vegetables',
                'price': 40.00,
                'unit': 'kg',
                'quantity': 150,
                'description': 'Sweet and crunchy carrots, great for juices and cooking.',
                'location': 'Whitefield, Bangalore',
                'harvest_date': datetime.now().date(),
            },
            {
                'seller': 'jayanth',
                'name': 'Basmati Rice',
                'category': 'grains',
                'price': 120.00,
                'unit': 'kg',
                'quantity': 500,
                'description': 'Premium quality basmati rice with excellent aroma.',
                'location': 'Mysore District',
                'harvest_date': (datetime.now() - timedelta(days=30)).date(),
            },
            {
                'seller': 'jayanth',
                'name': 'Sugarcane Juice',
                'category': 'dairy',
                'price': 30.00,
                'unit': 'litre',
                'quantity': 200,
                'description': 'Fresh sugarcane juice, made daily from our farm.',
                'location': 'Mysore District',
                'harvest_date': datetime.now().date(),
            },
            {
                'seller': 'jayanth',
                'name': 'Yellow Corn',
                'category': 'vegetables',
                'price': 35.00,
                'unit': 'kg',
                'quantity': 250,
                'description': 'Sweet and tender yellow corn, perfect for grilling.',
                'location': 'Mysore District',
                'harvest_date': datetime.now().date(),
            }
        ]
        
        for product_data in products_data:
            seller = created_users[product_data['seller']]
            
            product, created = Product.objects.get_or_create(
                seller=seller,
                name=product_data['name'],
                defaults={
                    'category': product_data['category'],
                    'price': product_data['price'],
                    'unit': product_data['unit'],
                    'quantity': product_data['quantity'],
                    'description': product_data['description'],
                    'harvest_date': product_data['harvest_date'],
                    'location': product_data['location'],
                    'status': 'available'
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"✓ Created product: {product_data['name']}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠ Product already exists: {product_data['name']}"))
        
        # Create equipment for farmers
        equipment_data_list = [
            {
                'owner': 'divij',
                'name': 'John Deere Tractor',
                'equipment_type': 'tractor',
                'daily_rate': 500.00,
                'weekly_rate': 2800.00,
                'monthly_rate': 10000.00,
                'location': 'Whitefield, Bangalore',
                'condition': 'Excellent',
                'brand': 'John Deere',
                'model': '5310',
                'year_manufactured': 2020,
            },
            {
                'owner': 'divij',
                'name': 'Crop Sprayer',
                'equipment_type': 'sprayer',
                'daily_rate': 200.00,
                'weekly_rate': 1000.00,
                'location': 'Whitefield, Bangalore',
                'condition': 'Good',
                'specifications': '500L capacity, 40L/min flow rate',
            },
            {
                'owner': 'jayanth',
                'name': 'Combine Harvester',
                'equipment_type': 'harvester',
                'daily_rate': 1000.00,
                'weekly_rate': 5500.00,
                'monthly_rate': 20000.00,
                'location': 'Mysore District',
                'condition': 'Good',
                'brand': 'CASE IH',
                'model': 'AXIAL-FLOW',
                'year_manufactured': 2018,
            }
        ]
        
        for equip_data in equipment_data_list:
            owner = created_users[equip_data['owner']]
            
            equipment, created = Equipment.objects.get_or_create(
                owner=owner,
                name=equip_data['name'],
                defaults={
                    'equipment_type': equip_data['equipment_type'],
                    'daily_rate': equip_data['daily_rate'],
                    'weekly_rate': equip_data.get('weekly_rate'),
                    'monthly_rate': equip_data.get('monthly_rate'),
                    'location': equip_data['location'],
                    'condition': equip_data.get('condition'),
                    'brand': equip_data.get('brand'),
                    'model': equip_data.get('model'),
                    'year_manufactured': equip_data.get('year_manufactured'),
                    'specifications': equip_data.get('specifications'),
                    'status': 'available',
                    'min_rental_days': 1,
                    'delivery_available': True,
                    'delivery_radius_km': 50,
                }
            )
            
            if created:
                self.stdout.write(self.style.SUCCESS(f"✓ Created equipment: {equip_data['name']}"))
            else:
                self.stdout.write(self.style.WARNING(f"⚠ Equipment already exists: {equip_data['name']}"))
        
        self.stdout.write(self.style.SUCCESS('\n✓ Database seeding completed successfully!'))
        self.stdout.write('\n' + '='*60)
        self.stdout.write('TEST ACCOUNTS:')
        self.stdout.write('='*60)
        for user_data in users_data:
            self.stdout.write(f"\nUsername: {user_data['username']}")
            self.stdout.write(f"Email: {user_data['email']}")
            self.stdout.write(f"Password: {user_data['password']}")
            self.stdout.write(f"Role: {user_data['role']}")

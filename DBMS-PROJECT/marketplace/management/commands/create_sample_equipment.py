from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from marketplace.models import Equipment
from decimal import Decimal

User = get_user_model()

class Command(BaseCommand):
    help = 'Create sample equipment for testing farmer-to-farmer rental'

    def handle(self, *args, **options):
        # Get farmer users
        try:
            farmer1 = User.objects.get(username='farmer_test')
        except User.DoesNotExist:
            self.stdout.write(self.style.ERROR('Farmer test user not found. Please run create_test_users first.'))
            return

        # Create a second farmer if it doesn't exist
        farmer2, created = User.objects.get_or_create(
            username='farmer_equipment',
            defaults={
                'email': 'farmer.equipment@example.com',
                'role': 'farmer',
                'phone': '+919876543210',
                'location': 'Punjab, India',
                'farm_size': Decimal('50.00')
            }
        )
        if created:
            farmer2.set_password('testpass123')
            farmer2.save()
            self.stdout.write(self.style.SUCCESS(f'Created new farmer user: {farmer2.username}'))

        sample_equipment = [
            {
                'name': 'John Deere Tractor',
                'equipment_type': 'tractor',
                'description': '50 HP John Deere tractor with 4WD, power steering, and hydraulic system. Well-maintained and regularly serviced.',
                'specifications': '50 HP, 4WD, Power Steering, Hydraulic System, Year 2015',
                'brand': 'John Deere',
                'model': '5310',
                'year_manufactured': 2015,
                'condition': 'excellent',
                'daily_rate': Decimal('1500.00'),
                'weekly_rate': Decimal('8500.00'),
                'monthly_rate': Decimal('30000.00'),
                'security_deposit': Decimal('5000.00'),
                'location': 'Maharashtra, India',
                'min_rental_days': 1,
                'max_rental_days': 30,
                'delivery_available': True,
                'delivery_radius_km': 50,
                'owner': farmer1,
            },
            {
                'name': 'Combine Harvester',
                'equipment_type': 'harvester',
                'description': 'Modern combine harvester ideal for grain harvest. Equipped with GPS and yield mapping technology.',
                'specifications': 'GPS Enabled, Yield Mapping, 4m Header, Fuel Capacity 250L',
                'brand': 'CLAAS',
                'model': 'Lexion 600',
                'year_manufactured': 2018,
                'condition': 'excellent',
                'daily_rate': Decimal('3500.00'),
                'weekly_rate': Decimal('20000.00'),
                'monthly_rate': Decimal('70000.00'),
                'security_deposit': Decimal('10000.00'),
                'location': 'Punjab, India',
                'min_rental_days': 1,
                'max_rental_days': 21,
                'delivery_available': True,
                'delivery_radius_km': 100,
                'owner': farmer2,
            },
            {
                'name': 'Irrigation Pump',
                'equipment_type': 'irrigation',
                'description': 'High-capacity irrigation pump for efficient water distribution. 5 HP motor, 500 GPM capacity.',
                'specifications': '5 HP Motor, 500 GPM, 80 PSI, Diesel Powered',
                'brand': 'Jain',
                'model': 'JP-500D',
                'year_manufactured': 2016,
                'condition': 'good',
                'daily_rate': Decimal('800.00'),
                'weekly_rate': Decimal('4500.00'),
                'monthly_rate': Decimal('15000.00'),
                'security_deposit': Decimal('2000.00'),
                'location': 'Maharashtra, India',
                'min_rental_days': 1,
                'max_rental_days': 60,
                'delivery_available': True,
                'delivery_radius_km': 30,
                'owner': farmer1,
            },
            {
                'name': 'Crop Sprayer',
                'equipment_type': 'sprayer',
                'description': 'Mounted crop sprayer with boom attachment. Capacity 500L, perfect for pesticide and fertilizer application.',
                'specifications': '500L Tank, 12m Boom, Pressure Gauge, Nozzles Included',
                'brand': 'Stihl',
                'model': 'SMS-4.5',
                'year_manufactured': 2017,
                'condition': 'good',
                'daily_rate': Decimal('600.00'),
                'weekly_rate': Decimal('3000.00'),
                'monthly_rate': Decimal('10000.00'),
                'security_deposit': Decimal('1500.00'),
                'location': 'Gujarat, India',
                'min_rental_days': 1,
                'max_rental_days': 30,
                'delivery_available': True,
                'delivery_radius_km': 25,
                'owner': farmer2,
            },
            {
                'name': 'Seed Drill',
                'equipment_type': 'seeder',
                'description': 'Precision seed drill for uniform seed placement. Suitable for wheat, rice, and other grains.',
                'specifications': '2m Width, 8 Row Configuration, Hopper Capacity 50kg',
                'brand': 'Agrotech',
                'model': 'AT-2000',
                'year_manufactured': 2014,
                'condition': 'fair',
                'daily_rate': Decimal('500.00'),
                'weekly_rate': Decimal('2500.00'),
                'monthly_rate': Decimal('8000.00'),
                'security_deposit': Decimal('1000.00'),
                'location': 'Maharashtra, India',
                'min_rental_days': 1,
                'max_rental_days': 15,
                'delivery_available': False,
                'owner': farmer1,
            },
            {
                'name': 'Cultivator',
                'equipment_type': 'cultivator',
                'description': 'Multi-purpose cultivator for soil preparation and weed removal. Heavy-duty construction for long-lasting performance.',
                'specifications': '3 Point Linkage, 2.5m Width, Heavy Duty Tines',
                'brand': 'Massey Ferguson',
                'model': 'MF-3000',
                'year_manufactured': 2019,
                'condition': 'excellent',
                'daily_rate': Decimal('700.00'),
                'weekly_rate': Decimal('3500.00'),
                'monthly_rate': Decimal('12000.00'),
                'security_deposit': Decimal('1800.00'),
                'location': 'Punjab, India',
                'min_rental_days': 1,
                'max_rental_days': 30,
                'delivery_available': True,
                'delivery_radius_km': 40,
                'owner': farmer2,
            },
        ]

        created_count = 0
        for eq_data in sample_equipment:
            # Check if equipment already exists
            if Equipment.objects.filter(
                name=eq_data['name'],
                owner=eq_data['owner']
            ).exists():
                self.stdout.write(self.style.WARNING(f'Equipment {eq_data["name"]} already exists'))
                continue
            
            # Create equipment
            equipment = Equipment.objects.create(**eq_data)
            created_count += 1
            self.stdout.write(self.style.SUCCESS(f'Successfully created equipment: {equipment.name}'))

        self.stdout.write(self.style.SUCCESS(f'Created {created_count} sample equipment listings'))

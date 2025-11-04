from rest_framework import serializers
from .models import Product, Equipment, EquipmentRental, Order
from users.serializers import UserSerializer

class ProductSerializer(serializers.ModelSerializer):
    farmer = serializers.ReadOnlyField(source='seller.id')
    farmer_name = serializers.ReadOnlyField(source='seller.username')
    harvest_date = serializers.DateField(format='%Y-%m-%d')
    
    class Meta:
        model = Product
        fields = ['id', 'farmer', 'farmer_name', 'name', 'category', 'price', 'unit', 'quantity', 
                  'description', 'image', 'location', 'harvest_date', 'created_at']
        read_only_fields = ['id', 'farmer', 'farmer_name', 'created_at']

class ProductCreateSerializer(serializers.ModelSerializer):
    harvest_date = serializers.DateField(format='%Y-%m-%d', required=False)
    
    class Meta:
        model = Product
        fields = ['name', 'description', 'category', 'price', 'unit', 'quantity', 'image', 'status', 'location', 'harvest_date']


class EquipmentSerializer(serializers.ModelSerializer):
    owner_id = serializers.ReadOnlyField(source='owner.id')
    owner_name = serializers.ReadOnlyField(source='owner.username')
    owner_phone = serializers.ReadOnlyField(source='owner.phone')
    owner_location = serializers.ReadOnlyField(source='owner.location')
    
    class Meta:
        model = Equipment
        fields = ['id', 'name', 'description', 'equipment_type', 'specifications', 'daily_rate', 
                  'weekly_rate', 'monthly_rate', 'security_deposit', 'image', 'status', 'location', 
                  'condition', 'year_manufactured', 'brand', 'model', 'min_rental_days', 'max_rental_days',
                  'delivery_available', 'delivery_radius_km', 'owner_id', 'owner_name', 'owner_phone', 
                  'owner_location', 'created_at']
        read_only_fields = ['id', 'owner_id', 'owner_name', 'owner_phone', 'owner_location', 'created_at']


class EquipmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = ['name', 'description', 'equipment_type', 'specifications', 'daily_rate', 
                  'weekly_rate', 'monthly_rate', 'security_deposit', 'image', 'status', 'location', 
                  'condition', 'year_manufactured', 'brand', 'model', 'min_rental_days', 'max_rental_days',
                  'delivery_available', 'delivery_radius_km']


class EquipmentRentalSerializer(serializers.ModelSerializer):
    equipment_name = serializers.ReadOnlyField(source='equipment.name')
    equipment_type = serializers.ReadOnlyField(source='equipment.equipment_type')
    renter_name = serializers.ReadOnlyField(source='renter.username')
    owner_name = serializers.ReadOnlyField(source='equipment.owner.username')
    
    class Meta:
        model = EquipmentRental
        fields = ['id', 'equipment', 'equipment_name', 'equipment_type', 'renter', 'renter_name', 
                  'owner_name', 'start_date', 'end_date', 'rental_days', 'daily_rate', 'total_amount', 
                  'security_deposit', 'delivery_required', 'delivery_address', 'special_instructions', 
                  'status', 'payment_status', 'created_at']
        read_only_fields = ['id', 'equipment_name', 'equipment_type', 'renter_name', 'owner_name', 'created_at']


class EquipmentRentalCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = EquipmentRental
        fields = ['equipment', 'start_date', 'end_date', 'rental_days', 'daily_rate', 'total_amount', 
                  'security_deposit', 'delivery_required', 'delivery_address', 'special_instructions']
    
    def validate(self, data):
        if data['end_date'] <= data['start_date']:
            raise serializers.ValidationError('End date must be after start date')
        return data


class OrderSerializer(serializers.ModelSerializer):
    product_name = serializers.ReadOnlyField(source='product.name')
    buyer_name = serializers.ReadOnlyField(source='buyer.username')
    seller_name = serializers.ReadOnlyField(source='seller.username')
    product_unit = serializers.ReadOnlyField(source='product.unit')
    
    class Meta:
        model = Order
        fields = ['id', 'product', 'product_name', 'product_unit', 'buyer', 'buyer_name', 'seller', 
                  'seller_name', 'quantity', 'unit_price', 'total_amount', 'status', 'payment_status', 
                  'delivery_address', 'special_instructions', 'created_at', 'updated_at']
        read_only_fields = ['id', 'product_name', 'buyer_name', 'seller_name', 'product_unit', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['product', 'quantity', 'unit_price', 'total_amount', 'delivery_address', 'special_instructions']
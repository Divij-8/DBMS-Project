from rest_framework import serializers
from .models import Product
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
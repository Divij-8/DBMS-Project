from rest_framework import serializers
from .models import FarmData

class FarmDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = FarmData
        fields = ['id', 'user', 'crop_type', 'planting_date', 'expected_harvest', 
                  'area', 'soil_type', 'irrigation_type', 'notes', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']
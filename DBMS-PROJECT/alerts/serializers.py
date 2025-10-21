from rest_framework import serializers
from .models import Alert

class AlertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alert
        fields = ['id', 'alert_type', 'title', 'message', 'severity', 'location', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']
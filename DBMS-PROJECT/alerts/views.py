from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Alert
from .serializers import AlertSerializer

class AlertViewSet(viewsets.ModelViewSet):
    queryset = Alert.objects.filter(is_active=True)
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    ordering = ['-created_at']
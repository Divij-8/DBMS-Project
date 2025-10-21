from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import FarmData
from .serializers import FarmDataSerializer

class FarmDataViewSet(viewsets.ModelViewSet):
    serializer_class = FarmDataSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return FarmData.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
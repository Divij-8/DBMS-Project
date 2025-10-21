from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from marketplace.models import Product
from farm_data.models import FarmData
from alerts.models import Alert
from datetime import timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    user = request.user
    user_products = Product.objects.filter(seller=user)
    user_farms = FarmData.objects.filter(user=user)
    
    recent_date = timezone.now() - timedelta(days=7)
    recent_alerts = Alert.objects.filter(is_active=True, created_at__gte=recent_date).count()
    
    return Response({
        'total_products': user_products.count(),
        'available_products': user_products.filter(status='available').count(),
        'active_farms': user_farms.count(),
        'recent_alerts': recent_alerts,
    })

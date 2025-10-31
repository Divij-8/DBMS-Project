from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import RegisterView, UserProfileView, current_user, CustomTokenObtainPairView
from marketplace.views import ProductViewSet, EquipmentViewSet, EquipmentRentalViewSet
from farm_data.views import FarmDataViewSet
from alerts.views import AlertViewSet
from .views import dashboard_stats

@api_view(['GET'])
def api_root_view(request):
    return Response({
        'message': 'Agricultural Management System API',
        'endpoints': {
            'register': '/api/auth/register/',
            'login': '/api/token/',
            'token_refresh': '/api/token/refresh/',
            'user': '/api/auth/user/',
            'profile': '/api/user/profile/',
            'products': '/api/products/',
            'equipment': '/api/equipment/',
            'equipment-rentals': '/api/equipment-rentals/',
            'farm-data': '/api/farm-data/',
            'alerts': '/api/alerts/',
            'dashboard': '/api/dashboard/stats/',
        }
    })

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'equipment', EquipmentViewSet, basename='equipment')
router.register(r'equipment-rentals', EquipmentRentalViewSet, basename='equipment-rental')
router.register(r'farm-data', FarmDataViewSet, basename='farm-data')
router.register(r'alerts', AlertViewSet, basename='alert')

urlpatterns = [
    path('', api_root_view, name='api-root'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/user/', current_user, name='current-user'),
    path('user/profile/', UserProfileView.as_view(), name='user-profile'),
    path('dashboard/stats/', dashboard_stats, name='dashboard-stats'),
    path('', include(router.urls)),
]
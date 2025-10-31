from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Product, Equipment, EquipmentRental
from .serializers import (
    ProductSerializer, ProductCreateSerializer,
    EquipmentSerializer, EquipmentCreateSerializer,
    EquipmentRentalSerializer, EquipmentRentalCreateSerializer
)

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.select_related('seller').all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'status']
    search_fields = ['name', 'description']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProductCreateSerializer
        return ProductSerializer
    
    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_products(self, request):
        """Get all products listed by the current farmer"""
        products = self.queryset.filter(seller=request.user)
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)


class EquipmentViewSet(viewsets.ModelViewSet):
    queryset = Equipment.objects.select_related('owner').all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['equipment_type', 'status', 'owner']
    search_fields = ['name', 'description', 'brand', 'model']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EquipmentCreateSerializer
        return EquipmentSerializer
    
    def perform_create(self, serializer):
        """Save equipment with the current user as owner"""
        serializer.save(owner=self.request.user)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_equipment(self, request):
        """Get all equipment owned by the current farmer"""
        equipment = self.queryset.filter(owner=request.user)
        serializer = EquipmentSerializer(equipment, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_equipment(self, request):
        """Get all available equipment for rental - only accessible to farmers"""
        # Only farmers can see equipment
        if request.user.is_authenticated and request.user.role != 'farmer':
            return Response([], status=status.HTTP_200_OK)
        
        equipment = self.queryset.filter(status='available')
        
        # Filter by equipment type if provided
        equipment_type = request.query_params.get('equipment_type', None)
        if equipment_type:
            equipment = equipment.filter(equipment_type=equipment_type)
        
        # Filter by location if provided
        location = request.query_params.get('location', None)
        if location:
            equipment = equipment.filter(location__icontains=location)
        
        serializer = EquipmentSerializer(equipment, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def available_dates(self, request, pk=None):
        """Get available rental dates for a specific equipment"""
        try:
            equipment = self.get_object()
        except Equipment.DoesNotExist:
            return Response({'error': 'Equipment not found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get all confirmed/active rentals
        rentals = equipment.rentals.filter(
            status__in=['confirmed', 'active']
        ).values_list('start_date', 'end_date')
        
        booked_dates = []
        for start, end in rentals:
            booked_dates.append({
                'start': start,
                'end': end
            })
        
        return Response({
            'equipment_id': equipment.id,
            'equipment_name': equipment.name,
            'booked_dates': booked_dates
        })


class EquipmentRentalViewSet(viewsets.ModelViewSet):
    queryset = EquipmentRental.objects.select_related('equipment', 'renter', 'equipment__owner').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'equipment', 'renter']
    search_fields = ['equipment__name', 'renter__username']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return EquipmentRentalCreateSerializer
        return EquipmentRentalSerializer
    
    def perform_create(self, serializer):
        """Save rental request with the current user as renter"""
        # Ensure only farmers can create rentals
        if self.request.user.role != 'farmer':
            raise status.HTTP_403_FORBIDDEN("Only farmers can rent equipment")
        serializer.save(renter=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Override create to add farmer-only validation"""
        if request.user.role != 'farmer':
            return Response(
                {'error': 'Only farmers can rent equipment from other farmers'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_rentals(self, request):
        """Get all rentals made by the current farmer"""
        rentals = self.queryset.filter(renter=request.user)
        serializer = EquipmentRentalSerializer(rentals, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_equipment_rentals(self, request):
        """Get all rental requests for equipment owned by the current farmer"""
        rentals = self.queryset.filter(equipment__owner=request.user)
        serializer = EquipmentRentalSerializer(rentals, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm_rental(self, request, pk=None):
        """Confirm a rental request (only equipment owner can do this)"""
        rental = self.get_object()
        
        if rental.equipment.owner != request.user:
            return Response(
                {'error': 'Only the equipment owner can confirm rentals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental.status != 'pending':
            return Response(
                {'error': f'Can only confirm pending rentals. Current status: {rental.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental.status = 'confirmed'
        rental.save()
        
        return Response({
            'message': 'Rental confirmed successfully',
            'rental': EquipmentRentalSerializer(rental).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel_rental(self, request, pk=None):
        """Cancel a rental request"""
        rental = self.get_object()
        
        # Either the renter or equipment owner can cancel
        if rental.renter != request.user and rental.equipment.owner != request.user:
            return Response(
                {'error': 'You do not have permission to cancel this rental'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental.status in ['completed', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel a {rental.status} rental'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental.status = 'cancelled'
        rental.save()
        
        # Set equipment status back to available if it was rented
        if rental.equipment.status == 'rented':
            rental.equipment.status = 'available'
            rental.equipment.save()
        
        return Response({
            'message': 'Rental cancelled successfully',
            'rental': EquipmentRentalSerializer(rental).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete_rental(self, request, pk=None):
        """Mark a rental as completed (only equipment owner can do this)"""
        rental = self.get_object()
        
        if rental.equipment.owner != request.user:
            return Response(
                {'error': 'Only the equipment owner can complete rentals'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if rental.status != 'active':
            return Response(
                {'error': f'Can only complete active rentals. Current status: {rental.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        rental.status = 'completed'
        rental.equipment.status = 'available'
        rental.save()
        rental.equipment.save()
        
        return Response({
            'message': 'Rental completed successfully',
            'rental': EquipmentRentalSerializer(rental).data
        })

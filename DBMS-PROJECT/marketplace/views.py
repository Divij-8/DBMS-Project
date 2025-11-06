from rest_framework import viewsets, filters, status, serializers
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import datetime, timedelta
from .models import Product, Equipment, EquipmentRental, Order, ProductInquiry, Message
from .serializers import (
    ProductSerializer, ProductCreateSerializer,
    EquipmentSerializer, EquipmentCreateSerializer,
    EquipmentRentalSerializer, EquipmentRentalCreateSerializer,
    OrderSerializer, OrderCreateSerializer,
    ProductInquirySerializer, ProductInquiryCreateSerializer,
    MessageSerializer, MessageCreateSerializer
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
        rental.payment_status = 'paid'  # Mark payment as paid when confirmed
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


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.select_related('product', 'buyer', 'seller').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'payment_status', 'buyer', 'seller']
    search_fields = ['product__name', 'buyer__username', 'seller__username']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    def perform_create(self, serializer):
        """Save order with current user as buyer and product seller as seller"""
        product = serializer.validated_data['product']
        serializer.save(buyer=self.request.user, seller=product.seller)
    
    def create(self, request, *args, **kwargs):
        """Override create to add buyer-only validation"""
        if request.user.role != 'buyer':
            return Response(
                {'error': 'Only buyers can place orders'},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_purchases(self, request):
        """Get all orders placed by the current buyer"""
        orders = self.queryset.filter(buyer=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_sales(self, request):
        """Get all orders received by the current farmer/seller"""
        orders = self.queryset.filter(seller=request.user)
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm_order(self, request, pk=None):
        """Confirm an order (only seller can do this)"""
        order = self.get_object()
        
        if order.seller != request.user:
            return Response(
                {'error': 'Only the seller can confirm orders'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if order.status != 'pending':
            return Response(
                {'error': f'Can only confirm pending orders. Current status: {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'confirmed'
        order.payment_status = 'paid'  # Mark payment as paid when order is confirmed
        order.save()
        
        return Response({
            'message': 'Order confirmed successfully',
            'order': OrderSerializer(order).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def cancel_order(self, request, pk=None):
        """Cancel an order"""
        order = self.get_object()
        
        # Either buyer or seller can cancel
        if order.buyer != request.user and order.seller != request.user:
            return Response(
                {'error': 'You do not have permission to cancel this order'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if order.status in ['delivered', 'cancelled']:
            return Response(
                {'error': f'Cannot cancel a {order.status} order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'cancelled'
        order.save()
        
        return Response({
            'message': 'Order cancelled successfully',
            'order': OrderSerializer(order).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_shipped(self, request, pk=None):
        """Mark order as shipped (only seller can do this)"""
        order = self.get_object()
        
        if order.seller != request.user:
            return Response(
                {'error': 'Only the seller can mark orders as shipped'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if order.status != 'confirmed':
            return Response(
                {'error': f'Can only ship confirmed orders. Current status: {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'shipped'
        order.save()
        
        return Response({
            'message': 'Order marked as shipped',
            'order': OrderSerializer(order).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_delivered(self, request, pk=None):
        """Mark order as delivered (only buyer can do this)"""
        order = self.get_object()
        
        if order.buyer != request.user:
            return Response(
                {'error': 'Only the buyer can mark orders as delivered'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if order.status != 'shipped':
            return Response(
                {'error': f'Can only mark shipped orders as delivered. Current status: {order.status}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'delivered'
        order.save()
        
        return Response({
            'message': 'Order marked as delivered',
            'order': OrderSerializer(order).data
        })


class ProductInquiryViewSet(viewsets.ModelViewSet):
    queryset = ProductInquiry.objects.select_related('product', 'inquirer', 'seller').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'product', 'inquirer', 'seller']
    search_fields = ['subject', 'message']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProductInquiryCreateSerializer
        return ProductInquirySerializer
    
    def perform_create(self, serializer):
        """Save inquiry with current user as inquirer"""
        # Ensure only farmers can create inquiries
        if self.request.user.role != 'farmer':
            raise serializers.ValidationError("Only farmers can inquire about products or equipment")
        
        inquiry_type = serializer.validated_data.get('inquiry_type')
        product = serializer.validated_data.get('product')
        equipment = serializer.validated_data.get('equipment')
        
        # Determine seller based on inquiry type
        if inquiry_type == 'product' and product:
            seller = product.seller
            if seller == self.request.user:
                raise serializers.ValidationError("You cannot inquire about your own products")
        elif inquiry_type == 'equipment' and equipment:
            seller = equipment.owner
            if seller == self.request.user:
                raise serializers.ValidationError("You cannot inquire about your own equipment")
        else:
            raise serializers.ValidationError("Invalid inquiry type or missing item")
        
        serializer.save(inquirer=self.request.user, seller=seller)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_inquiries_sent(self, request):
        """Get all inquiries sent by the current user"""
        inquiries = self.queryset.filter(inquirer=request.user)
        serializer = ProductInquirySerializer(inquiries, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_inquiries_received(self, request):
        """Get all inquiries received by the current user (for their products)"""
        inquiries = self.queryset.filter(seller=request.user)
        serializer = ProductInquirySerializer(inquiries, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_status(self, request, pk=None):
        """Update inquiry status"""
        inquiry = self.get_object()
        
        if inquiry.seller != request.user and inquiry.inquirer != request.user:
            return Response(
                {'error': 'You do not have permission to update this inquiry'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        new_status = request.data.get('status')
        if new_status not in dict(ProductInquiry.STATUS_CHOICES):
            return Response(
                {'error': f'Invalid status. Choose from: {[choice[0] for choice in ProductInquiry.STATUS_CHOICES]}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        inquiry.status = new_status
        inquiry.save()
        
        return Response({
            'message': f'Inquiry status updated to {new_status}',
            'inquiry': ProductInquirySerializer(inquiry).data
        })


class MessageViewSet(viewsets.ModelViewSet):
    queryset = Message.objects.select_related('inquiry', 'sender', 'recipient').all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['inquiry', 'sender', 'recipient']
    ordering = ['created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    def perform_create(self, serializer):
        """Save message with current user as sender"""
        inquiry = serializer.validated_data['inquiry']
        
        # Verify user is part of this conversation
        if self.request.user != inquiry.inquirer and self.request.user != inquiry.seller:
            raise serializers.ValidationError("You are not part of this conversation")
        
        # Determine recipient
        if self.request.user == inquiry.inquirer:
            recipient = inquiry.seller
        else:
            recipient = inquiry.inquirer
        
        serializer.save(sender=self.request.user, recipient=recipient)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_conversations(self, request):
        """Get all unique conversations for the current user"""
        # Get all inquiries where user is inquirer or seller
        inquiries = ProductInquiry.objects.filter(
            Q(inquirer=request.user) | Q(seller=request.user)
        )
        serializer = ProductInquirySerializer(inquiries, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_as_read(self, request, pk=None):
        """Mark a message as read"""
        message = self.get_object()
        
        if message.recipient != request.user:
            return Response(
                {'error': 'You cannot mark messages from other users as read'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        message.is_read = True
        message.save()
        
        return Response({
            'message': 'Message marked as read',
            'message_obj': MessageSerializer(message).data
        })

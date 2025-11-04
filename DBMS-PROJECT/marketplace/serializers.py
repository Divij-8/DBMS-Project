from rest_framework import serializers
from .models import Product, Equipment, EquipmentRental, Order, ProductInquiry, Message
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


class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.ReadOnlyField(source='sender.username')
    recipient_name = serializers.ReadOnlyField(source='recipient.username')
    
    class Meta:
        model = Message
        fields = ['id', 'inquiry', 'sender', 'sender_name', 'recipient', 'recipient_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['id', 'sender_name', 'recipient_name', 'created_at']


class ProductInquirySerializer(serializers.ModelSerializer):
    inquirer_name = serializers.ReadOnlyField(source='inquirer.username')
    seller_name = serializers.ReadOnlyField(source='seller.username')
    product_name = serializers.SerializerMethodField()
    equipment_name = serializers.SerializerMethodField()
    item_name = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)
    unread_count = serializers.SerializerMethodField()
    
    def get_product_name(self, obj):
        return obj.product.name if obj.product else None
    
    def get_equipment_name(self, obj):
        return obj.equipment.name if obj.equipment else None
    
    def get_item_name(self, obj):
        return obj.product.name if obj.product else (obj.equipment.name if obj.equipment else None)
    
    def get_unread_count(self, obj):
        return obj.messages.filter(is_read=False).count()
    
    class Meta:
        model = ProductInquiry
        fields = ['id', 'inquiry_type', 'product', 'product_name', 'equipment', 'equipment_name', 
                  'item_name', 'inquirer', 'inquirer_name', 'seller', 'seller_name', 
                  'subject', 'message', 'status', 'messages', 'unread_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'product_name', 'equipment_name', 'item_name', 'inquirer_name', 'seller_name', 'created_at', 'updated_at']


class ProductInquiryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductInquiry
        fields = ['inquiry_type', 'product', 'equipment', 'subject', 'message']
    
    def validate(self, data):
        inquiry_type = data.get('inquiry_type')
        product = data.get('product')
        equipment = data.get('equipment')
        
        if inquiry_type == 'product' and not product:
            raise serializers.ValidationError('Product must be specified for product inquiries')
        if inquiry_type == 'equipment' and not equipment:
            raise serializers.ValidationError('Equipment must be specified for equipment inquiries')
        if inquiry_type == 'product' and equipment:
            raise serializers.ValidationError('Do not specify equipment for product inquiries')
        if inquiry_type == 'equipment' and product:
            raise serializers.ValidationError('Do not specify product for equipment inquiries')
        
        return data


class MessageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['inquiry', 'content']
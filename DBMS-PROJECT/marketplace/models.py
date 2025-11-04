from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from datetime import timedelta
from users.models import User

class Product(models.Model):
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
        ('reserved', 'Reserved'),
    ]
    
    CATEGORY_CHOICES = [
        ('vegetables', 'Vegetables'),
        ('fruits', 'Fruits'),
        ('grains', 'Grains'),
        ('dairy', 'Dairy'),
        ('livestock', 'Livestock'),
        ('equipment', 'Equipment'),
        ('seeds', 'Seeds'),
        ('fertilizers', 'Fertilizers'),
        ('other', 'Other'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    unit = models.CharField(max_length=50)
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', blank=True, null=True)
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='products')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    location = models.CharField(max_length=255, blank=True, null=True)
    harvest_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'products'
    
    def __str__(self):
        return self.name


class Equipment(models.Model):
    EQUIPMENT_TYPE_CHOICES = [
        ('tractor', 'Tractor'),
        ('harvester', 'Harvester'),
        ('plow', 'Plow'),
        ('sprayer', 'Sprayer'),
        ('seeder', 'Seeder'),
        ('cultivator', 'Cultivator'),
        ('irrigation', 'Irrigation System'),
        ('storage', 'Storage Equipment'),
        ('processing', 'Processing Equipment'),
        ('other', 'Other'),
    ]
    
    STATUS_CHOICES = [
        ('available', 'Available'),
        ('rented', 'Rented'),
        ('maintenance', 'Under Maintenance'),
        ('unavailable', 'Unavailable'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    equipment_type = models.CharField(max_length=50, choices=EQUIPMENT_TYPE_CHOICES)
    specifications = models.TextField(blank=True, null=True)
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    weekly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    monthly_rate = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    image = models.ImageField(upload_to='equipment/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='available')
    location = models.CharField(max_length=255, blank=True, null=True)
    condition = models.CharField(max_length=100, blank=True, null=True)
    year_manufactured = models.IntegerField(blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    model = models.CharField(max_length=100, blank=True, null=True)
    min_rental_days = models.IntegerField(default=1)
    max_rental_days = models.IntegerField(blank=True, null=True)
    delivery_available = models.BooleanField(default=False)
    delivery_radius_km = models.IntegerField(blank=True, null=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name='equipment')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'equipment'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.equipment_type}"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('shipped', 'Shipped'),
        ('delivered', 'Delivered'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='orders')
    buyer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sales')
    quantity = models.DecimalField(max_digits=10, decimal_places=2)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    delivery_address = models.TextField(blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'orders'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Order {self.id} - {self.product.name} ({self.quantity} {self.product.unit})"


class EquipmentRental(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    PAYMENT_STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='rentals')
    renter = models.ForeignKey(User, on_delete=models.CASCADE, related_name='equipment_rentals')
    start_date = models.DateField()
    end_date = models.DateField()
    rental_days = models.IntegerField()
    daily_rate = models.DecimalField(max_digits=10, decimal_places=2)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    security_deposit = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    delivery_required = models.BooleanField(default=False)
    delivery_address = models.TextField(blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'equipment_rentals'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.equipment.name} - {self.renter.username} ({self.start_date} to {self.end_date})"
    
    def clean(self):
        if self.end_date <= self.start_date:
            raise ValidationError('End date must be after start date')
        # Ensure only farmers can rent equipment
        if self.renter.role != 'farmer':
            raise ValidationError('Only farmers can rent equipment')


class ProductInquiry(models.Model):
    """Inquiry from one farmer about another farmer's product or equipment"""
    STATUS_CHOICES = [
        ('open', 'Open'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
        ('closed', 'Closed'),
    ]
    
    INQUIRY_TYPE_CHOICES = [
        ('product', 'Product'),
        ('equipment', 'Equipment'),
    ]
    
    inquiry_type = models.CharField(max_length=20, choices=INQUIRY_TYPE_CHOICES, default='product')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='inquiries', blank=True, null=True)
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='inquiries', blank=True, null=True)
    inquirer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inquiries_sent')
    seller = models.ForeignKey(User, on_delete=models.CASCADE, related_name='inquiries_received')
    subject = models.CharField(max_length=255)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'product_inquiries'
        ordering = ['-created_at']
        unique_together = ('product', 'inquirer', 'equipment')
    
    def __str__(self):
        item_name = self.product.name if self.product else self.equipment.name
        return f"Inquiry: {self.subject} - {self.inquirer.username} to {self.seller.username} ({item_name})"
    
    def clean(self):
        # Ensure either product or equipment is provided, but not both
        if not self.product and not self.equipment:
            raise ValidationError('Either product or equipment must be specified')
        if self.product and self.equipment:
            raise ValidationError('Cannot inquire about both product and equipment at the same time')


class Message(models.Model):
    """Chat messages between farmers regarding product inquiries"""
    inquiry = models.ForeignKey(ProductInquiry, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_messages')
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'messages'
        ordering = ['created_at']
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"

from django.contrib import admin
from .models import Product, Equipment, EquipmentRental

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'quantity', 'seller', 'status', 'created_at']
    list_filter = ['category', 'status', 'created_at']
    search_fields = ['name', 'seller__username']


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'equipment_type', 'owner', 'status', 'daily_rate', 'created_at']
    list_filter = ['equipment_type', 'status', 'created_at']
    search_fields = ['name', 'owner__username', 'brand', 'model']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(EquipmentRental)
class EquipmentRentalAdmin(admin.ModelAdmin):
    list_display = ['equipment', 'renter', 'start_date', 'end_date', 'status', 'payment_status', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_status', 'created_at']
    search_fields = ['equipment__name', 'renter__username']
    readonly_fields = ['created_at', 'updated_at']

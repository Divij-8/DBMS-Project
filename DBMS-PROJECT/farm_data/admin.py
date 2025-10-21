from django.contrib import admin
from .models import FarmData

@admin.register(FarmData)
class FarmDataAdmin(admin.ModelAdmin):
    list_display = ['crop_type', 'user', 'planting_date', 'area', 'created_at']
    list_filter = ['soil_type', 'irrigation_type']
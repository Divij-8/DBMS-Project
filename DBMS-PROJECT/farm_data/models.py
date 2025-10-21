from django.db import models
from users.models import User

class FarmData(models.Model):
    SOIL_TYPES = [
        ('clay', 'Clay'),
        ('sandy', 'Sandy'),
        ('loamy', 'Loamy'),
        ('silt', 'Silt'),
    ]
    
    IRRIGATION_TYPES = [
        ('drip', 'Drip'),
        ('sprinkler', 'Sprinkler'),
        ('surface', 'Surface'),
        ('manual', 'Manual'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='farm_data')
    crop_type = models.CharField(max_length=255)
    planting_date = models.DateField()
    expected_harvest = models.DateField()
    area = models.DecimalField(max_digits=10, decimal_places=2)
    soil_type = models.CharField(max_length=50, choices=SOIL_TYPES)
    irrigation_type = models.CharField(max_length=50, choices=IRRIGATION_TYPES)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'farm_data'
    
    def __str__(self):
        return f"{self.crop_type} - {self.user.username}"

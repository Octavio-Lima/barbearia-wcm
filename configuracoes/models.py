from django.db import models

# Create your models here.
class Shop(models.Model):
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    shopName = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.name}"
from django.db import models

# Create your models here.
class Shop(models.Model):
    field_id = models.BigAutoField(auto_created=True, primary_key=True, verbose_name='ID')
    shopName = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.shopName}"

class ShopSetting(models.Model):
    shopId = models.IntegerField()
    opensAt = models.TimeField()
    closesAt = models.TimeField()
    workDays = models.CharField(max_length=255)
    firstWeekDay = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.shopId}"

class ShopProduct(models.Model):
    shopId = models.IntegerField()
    products = models.TextField()

    def __str__(self):
        return f"{self.shopId}"
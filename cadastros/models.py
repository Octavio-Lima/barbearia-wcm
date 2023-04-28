from django.db import models

# Create your models here.
class User(models.Model):
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    shopId = models.IntegerField()
    username = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    accessType = models.TextField()
    name = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.name}"
    
class BarberUserSetting(models.Model):
    ShopID = models.IntegerField()
    BarbeiroId = models.IntegerField()
    Serviços = models.TextField()
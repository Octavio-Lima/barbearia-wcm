from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# region  Usuarios
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    shopId = models.IntegerField(default=0)
    accessType = models.TextField(default="")

    def __str__(self):
        return f"{self.id} - {self.user}"

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_usuario(sender, instance, **kwargs):
    instance.profile.save()

class BarberUserSetting(models.Model):
    barberId = models.IntegerField()
    services = models.TextField()

    def __str__(self):
        return f"{self.barberId}"
# endregion
# region  Clientes
class Client(models.Model):
    shopId = models.IntegerField()
    barberId = models.IntegerField()
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20)
    email = models.CharField(max_length=255)
    instagram = models.CharField(max_length=255)
    services = models.TextField()
    date = models.DateField()
    schedule = models.TimeField(default='00:00')
    duration = models.CharField(max_length=5)
    toPay = models.FloatField()

    def __str__(self):
        return f"{self.nome}"
    
class Payment(models.Model):
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50)
    createDate = models.DateField()
    payDate = models.DateField()
    createdBy = models.CharField(max_length=255)
    value = models.FloatField()
    paymentType = models.CharField(max_length=30)
    client = models.CharField(max_length=255)
    shopId = models.IntegerField()

    def __str__(self):
        return f"{self.nome}"

# endregion
# region  Barbearias
class Shop(models.Model):
    shopName = models.CharField(max_length=255, default="Nome Barbearia")
    opensAt = models.TimeField(default="09:00")
    closesAt = models.TimeField(default="17:00")
    workDays = models.CharField(max_length=255, default="mon,tue,wed,thu,fri")
    firstWeekDay = models.CharField(max_length=255, default="sun")
    products = models.TextField(default="[]")
    
    def __str__(self):
        return f"{self.id} - {self.shopName}"
# endregion
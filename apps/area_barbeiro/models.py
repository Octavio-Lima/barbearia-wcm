from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

# Usuarios
class Usuario(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    shopId = models.IntegerField(default=0)
    accessType = models.TextField(default="")

    def __str__(self):
        return f"{self.user}"

@receiver(post_save, sender=User)
def create_user_usuario(sender, instance, created, **kwargs):
    if created:
        Usuario.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_usuario(sender, instance, **kwargs):
    instance.usuario.save()

class BarberUserSetting(models.Model):
    shopId = models.IntegerField()
    barberId = models.IntegerField()
    services = models.TextField()
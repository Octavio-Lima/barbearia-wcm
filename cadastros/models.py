from django.db import models

# Create your models here.
class RequestUser(models.Model):
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    logName = models.CharField(max_length=255)
    password = models.CharField(max_length=255)
    accessType = models.CharField(max_length=255)
    name = models.CharField(max_length=255)

class SendUser(models.Model):
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    match = models.CharField(max_length=255)
    accessType = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
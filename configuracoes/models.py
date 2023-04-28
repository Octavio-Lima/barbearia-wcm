from django.db import models

# Create your models here.
class Shop(models.Model):
    field_id = models.BigAutoField(auto_created=True, primary_key=True, verbose_name='ID')
    shopName = models.CharField(max_length=255)
    
    def __str__(self):
        return f"{self.shopName}"

class ShopSettings(models.Model):
    ShopID = models.IntegerField()
    AbreAs = models.TimeField()
    FechaAs = models.TimeField()
    DiasDeTrabalho = models.CharField(max_length=255)
    PrimeiroDiaDaSemana = models.CharField(max_length=255)

    def __str__(self):
        return f"{self.ShopID}"

class ShopProducts(models.Model):
    ShopID = models.IntegerField()
    Produtos = models.TextField()

    def __str__(self):
        return f"{self.ShopID}"
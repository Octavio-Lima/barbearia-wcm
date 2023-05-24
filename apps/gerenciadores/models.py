from django.db import models

# Create your models here.
class Cliente(models.Model):
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
    
class Lancamento(models.Model):
    id = models.BigAutoField(auto_created=True, primary_key=True)
    nome = models.CharField(max_length=255)
    tipo = models.CharField(max_length=50)
    diaCriado = models.DateField()
    diaPago = models.DateField()
    criadoPor = models.CharField(max_length=255)
    valor = models.FloatField()
    formaDePagamento = models.CharField(max_length=30)
    cliente = models.CharField(max_length=255)
    id_barbearia = models.IntegerField()

    def __str__(self):
        return f"{self.nome}"
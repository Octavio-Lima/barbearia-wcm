from django.db import models

# Create your models here.
class Cliente(models.Model):
    id = models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')
    shopID = models.IntegerField()
    barberID = models.IntegerField()
    nome = models.CharField(max_length=255)
    celular = models.CharField(max_length=20)
    email = models.CharField(max_length=255)
    instagram = models.CharField(max_length=255)
    servicos = models.TextField()
    dia = models.DateField()
    horaInicio = models.IntegerField()
    minuto = models.IntegerField()
    duracao = models.IntegerField()
    valorPagar = models.FloatField()

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
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
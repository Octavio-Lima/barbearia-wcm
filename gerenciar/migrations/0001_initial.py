# Generated by Django 4.2 on 2023-04-28 06:32

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Cliente',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('shopID', models.IntegerField()),
                ('barberID', models.IntegerField()),
                ('nome', models.CharField(max_length=255)),
                ('celular', models.CharField(max_length=20)),
                ('email', models.CharField(max_length=255)),
                ('instagram', models.CharField(max_length=255)),
                ('servicos', models.TextField()),
                ('dia', models.DateField()),
                ('horaInicio', models.IntegerField()),
                ('minuto', models.IntegerField()),
                ('duracao', models.IntegerField()),
                ('valorPagar', models.FloatField()),
            ],
        ),
    ]
# Generated by Django 4.2 on 2023-04-28 05:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('configuracoes', '0003_remove_shop_id_shop_field_id'),
    ]

    operations = [
        migrations.CreateModel(
            name='ShopSettings',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ShopID', models.IntegerField()),
                ('AbreAs', models.TimeField()),
                ('FechaAs', models.TimeField()),
                ('DiasDeTrabalho', models.CharField(max_length=255)),
                ('PrimeiroDiaDaSemana', models.CharField(max_length=255)),
            ],
        ),
    ]
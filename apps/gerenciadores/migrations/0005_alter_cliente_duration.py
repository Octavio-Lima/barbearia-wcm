# Generated by Django 4.2 on 2023-05-23 03:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('gerenciadores', '0004_rename_barberid_cliente_barberid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='cliente',
            name='duration',
            field=models.CharField(max_length=5),
        ),
    ]
# Generated by Django 4.2 on 2023-05-27 20:35

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('area_barbeiro', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='usuario',
            name='name',
        ),
        migrations.RemoveField(
            model_name='usuario',
            name='password',
        ),
        migrations.RemoveField(
            model_name='usuario',
            name='username',
        ),
    ]

# Generated by Django 4.2 on 2023-05-27 16:55

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('cadastros', '0006_rename_barbeiroid_barberusersetting_barberid_and_more'),
    ]

    operations = [
        migrations.DeleteModel(
            name='BarberUserSetting',
        ),
        migrations.DeleteModel(
            name='User',
        ),
    ]

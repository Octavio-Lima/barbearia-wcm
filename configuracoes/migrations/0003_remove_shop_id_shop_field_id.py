# Generated by Django 4.2 on 2023-04-28 05:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('configuracoes', '0002_alter_shop_id'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='shop',
            name='id',
        ),
        migrations.AddField(
            model_name='shop',
            name='field_id',
            field=models.BigAutoField(auto_created=True, default=1, primary_key=True, serialize=False, verbose_name='ID'),
            preserve_default=False,
        ),
    ]

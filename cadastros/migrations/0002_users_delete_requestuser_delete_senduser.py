# Generated by Django 4.2 on 2023-04-25 03:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cadastros', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Users',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('logName', models.CharField(max_length=255)),
                ('password', models.CharField(max_length=255)),
                ('accessType', models.TextField()),
                ('name', models.CharField(max_length=255)),
            ],
        ),
        migrations.DeleteModel(
            name='RequestUser',
        ),
        migrations.DeleteModel(
            name='SendUser',
        ),
    ]

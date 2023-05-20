from django.contrib import admin
from .models import User, BarberUserSetting

# Register your models here.
admin.site.register(User)
admin.site.register(BarberUserSetting)
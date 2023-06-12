from django.contrib import admin
from .models import *

# Register your models here.
admin.site.register(Profile)
admin.site.register(BarberUserSetting)
admin.site.register(Shop)
admin.site.register(Client)
admin.site.register(Payment)
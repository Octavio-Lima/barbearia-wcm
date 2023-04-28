from django.contrib import admin
from .models import Shop, ShopSettings, ShopProducts

# Register your models here.
admin.site.register(Shop)
admin.site.register(ShopSettings)
admin.site.register(ShopProducts)
from django.contrib import admin
from .models import Shop, ShopSetting, ShopProduct

# Register your models here.
admin.site.register(Shop)
admin.site.register(ShopSetting)
admin.site.register(ShopProduct)
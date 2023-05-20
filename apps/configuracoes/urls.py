from django.urls import path

from . import views

urlpatterns = [
    path("configShop/", views.configShop, name="configShop"),
    path("configService/", views.configService, name="configService"),
    path("configProducts/", views.configProducts, name="configProducts"),
]
from django.urls import path

from . import views

urlpatterns = [
    path('users/', views.ajaxUser.as_view()),
    path('users/barber/config', views.ajaxBarberConfig.as_view()),
    path('shop/config', views.ajaxShopConfig.as_view()),
    path('shop/config/products', views.ajaxProductConfig.as_view()),
    path('clients/', views.ajaxClients.as_view()),
]
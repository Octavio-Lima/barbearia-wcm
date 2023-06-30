from django.urls import path

from . import views

urlpatterns = [
    path('users/', views.ajaxUser.as_view()),
    path('users/barber/config', views.ajaxBarberConfig.as_view()),
    path('shop/', views.ajaxShopName.as_view()),
    path('shop/config/', views.ajaxShopConfig.as_view()),
    path('shop/config/products', views.ajaxProductConfig.as_view()),
    path('clients/', views.ajax_clients.as_view()),
    path('financial/', views.ajax_financial.as_view()),
    path('authenticate/', views.ajax_user_authentication.as_view(), name='api_authenticate'),
]
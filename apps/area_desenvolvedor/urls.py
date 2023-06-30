from django.urls import path
from . import views 

urlpatterns = [
    path('', views.list_all_shops_page, name='dev_shop_list_page')
]
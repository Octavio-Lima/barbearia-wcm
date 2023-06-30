from django.urls import path
from apps.area_barbeiro.views import login_page, forgot_password_page
from apps.area_desenvolvedor.views import list_all_shops_page

urlpatterns = [
    path('', list_all_shops_page),
    path('login/', login_page, name='acessar_global', kwargs={'page_shop_id': 0}),
    path('recuperar_senha/', forgot_password_page, name='recuperar_senha_global'),
]
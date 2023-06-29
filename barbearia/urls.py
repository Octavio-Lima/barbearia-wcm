from django.contrib import admin
from django.urls import include, path
from apps.area_barbeiro.models import Shop
from apps.area_barbeiro.views import login_page
from django.views.generic import View
from django.http.response import HttpResponse;


# Carregar a URL de cada barbearia
shop_list = list(Shop.objects.all().values('url', 'id'))

# Tela para escolher barbearia
def shop_list_page(request):
    anchor_list = ''
    for shop in shop_list:
        anchor_list += f'<a href="{shop.get("url")}">id: {shop.get("id")} - {shop.get("url")}</a>'
    
    return HttpResponse(anchor_list)

urlpatterns = [
    path('ajax/', include("apps.ajaxHandler.urls")),
    path('admin/', admin.site.urls),
    path('', shop_list_page),
    path('login/', login_page.as_view(), name='acessar_global', kwargs={'shop_id': 0}),
]

# Adicionar a url na url pattens
for shop in shop_list:
    new_barber_path = [path(f"{shop.get('url')}/gerenciar/", include("apps.area_barbeiro.urls"), {'shop_id': shop.get('id')})]
    new_client_path = [path(f"{shop.get('url')}/", include("apps.area_cliente.urls"), {'shop_id': shop.get('id')})]
    urlpatterns.extend(new_barber_path)
    urlpatterns.extend(new_client_path)
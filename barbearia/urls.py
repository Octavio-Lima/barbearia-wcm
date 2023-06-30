from django.urls import include, path
from django.contrib import admin
from apps.area_barbeiro.models import Shop

urlpatterns = [
    path('admin/', admin.site.urls),
    path('<str:shop_url>/gerenciar/', include("apps.area_barbeiro.urls")),
    path('<str:shop_url>/', include("apps.area_cliente.urls")),
    path('ajax/', include("apps.ajaxHandler.urls")),
    path('dev/', include("apps.area_desenvolvedor.urls")),
    path('', include('apps.site_principal.urls')),
]

# # Adicionar a url de cada barbearia na url pattens
# shop_list = list(Shop.objects.all().values('url', 'id'))

# for shop in shop_list:
#     new_barber_path = [path(f"{shop.get('url')}/gerenciar/", include("apps.area_barbeiro.urls"), {'page_shop_id': shop.get('id')})]
#     new_client_path = [path(f"{shop.get('url')}/", include("apps.area_cliente.urls"), {'page_shop_id': shop.get('id')})]
#     urlpatterns.extend(new_barber_path)
#     urlpatterns.extend(new_client_path)
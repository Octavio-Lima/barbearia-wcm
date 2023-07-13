from django.urls import include, path
from django.contrib import admin
from apps.area_barbeiro.models import Shop

urlpatterns = [
    path('admin/', admin.site.urls),
    path('ajax/', include("apps.ajaxHandler.urls")),
    path('dev/', include("apps.area_desenvolvedor.urls")),
    path('', include('apps.site_principal.urls')),
    path('<str:shop_url>/gerenciar/', include("apps.area_barbeiro.urls")),
    path('<str:shop_url>/', include("apps.area_cliente.urls")),
]
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('', include("apps.area_cliente.urls")),
    path('nomebarbearia/', include("apps.area_barbeiro.urls")),
    path('gerenciar/', include("apps.gerenciadores.urls")),
    path('configuracoes/', include("apps.configuracoes.urls")),
    path('admin/', admin.site.urls),
    path('ajax/', include("apps.ajaxHandler.urls")),
]
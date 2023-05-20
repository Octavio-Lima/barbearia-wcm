from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('mainpage/', include("apps.telaprincipal.urls")),
    path('gerenciar/', include("apps.gerenciadores.urls")),
    path('configuracoes/', include("apps.configuracoes.urls")),
    path('', include("apps.cadastros.urls")),
    path('cadastrar/', include("apps.cadastrarcliente.urls")),
    path('admin/', admin.site.urls),
    path('ajax/', include("apps.ajaxHandler.urls")),
]
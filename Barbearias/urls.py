from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('mainpage/', include("telaprincipal.urls")),
    path('gerenciar/', include("gerenciar.urls")),
    path('configuracoes/', include("configuracoes.urls")),
    path('', include("cadastros.urls")),
    path('cadastrar/', include("cadastrarcliente.urls")),
    path('admin/', admin.site.urls),
]

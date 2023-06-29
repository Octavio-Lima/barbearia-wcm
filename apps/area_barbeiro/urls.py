from django.urls import path

from . import views

urlpatterns = [
    path("", views.main_page, name="tela_principal"),
    path("acessar/", views.login_page.as_view(), name="acessar"),
    path("sair/", views.logoutUser, name="sair"),
    path("redefinir-senha/", views.redefineAccess, name="redefinir_senha"),
    path("fluxo-de-caixa", views.fluxo_de_caixa, name="fluxo_de_caixa"),
    path("agendamentos", views.agendamentos, name="agendamentos"),
    path("configuracao/", views.shop_settings_page, name="configurar_barbearia"),
    path("configuracao/servicos", views.shop_settings_services_page, name="configurar_servicos"),
    path("configuracao/produtos", views.shop_settings_products_page, name="configurar_produtos"),
]
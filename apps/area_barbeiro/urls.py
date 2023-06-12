from django.urls import path

from . import views

urlpatterns = [
    path("", views.TelaPrincipal, name="tela-principal"),
    path("acessar/", views.loginPage.as_view(), name="acessar"),
    path("sair/", views.logoutUser, name="sair"),
    path("redefinir-senha/", views.redefineAccess, name="redefinir-senha"),
    path("fluxoDeCaixa", views.fluxoDeCaixa, name="Fluxo de Caixa"),
    path("Agendamentos", views.Agendamentos, name="Agendamentos"),
    path("configShop/", views.configShop, name="configShop"),
    path("configService/", views.configService, name="configService"),
    path("configProducts/", views.configProducts, name="configProducts"),
]
from django.urls import path

from . import views

urlpatterns = [
    path("", views.TelaPrincipal, name="tela-principal"),
    path("acessar/", views.loginPage.as_view(), name="acessar"),
    path("redefinir-senha/", views.redefineAccess, name="redefinir-senha"),
]
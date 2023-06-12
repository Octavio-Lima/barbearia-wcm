from django.urls import path

from . import views

urlpatterns = [
    path("", views.RedirectToRegister, name="Redirecionar"),
    path("agendar-cliente/", views.RegisterNewClient, name="Cadastrar Clientes"),
]
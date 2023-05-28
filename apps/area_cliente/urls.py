from django.urls import path

from . import views

urlpatterns = [
    path("agendar-cliente/", views.RegisterNewClient, name="Cadastrar Clientes"),
]
from django.urls import path

from . import views

urlpatterns = [
    path("newClient/", views.RegisterNewClient, name="Cadastrar Clientes"),
]
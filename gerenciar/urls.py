from django.urls import path

from . import views

urlpatterns = [
    path("fluxoDeCaixa", views.fluxoDeCaixa, name="Fluxo de Caixa"),
    path("Agendamentos", views.Agendamentos, name="Agendamentos"),
]
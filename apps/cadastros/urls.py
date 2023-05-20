from django.urls import path

from . import views

urlpatterns = [
    path("", views.login, name="Login"),
    path("esqueci-a-senha", views.redefineAccess, name="Redefinir_Senha"),
]
from django.views.generic import View
from django.contrib.auth import authenticate, logout, login
from django.template import loader
from django.shortcuts import redirect
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from .models import Usuario
import json
from .link_list import CreateLinkList

from .forms import UserForm

def TelaPrincipal(request):
    accessData = list(Usuario.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']

    # Gerar text de lista de funções do usuario
    userJobFunctions = ""
    for i, title in enumerate(accessType):
        userJobFunctions += title
        
        # Adicionar separador entre os titulos do usuario
        if i != (len(accessType) - 1):
            userJobFunctions += ' - '

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = CreateLinkList(accessType)

    context = { 'funcao': userJobFunctions, 'listaLinks': pageLinks }
    template = loader.get_template('area_barbeiro/tela-principal.html')
    return HttpResponse(template.render(context, request))

class loginPage(View):
    def get(self, request):
        form = UserForm()
        template = loader.get_template('area_barbeiro/acessar.html')
        context = { "form": form }
        
        return HttpResponse(template.render(context, request))

    def post(self, request):
        form = UserForm(request.POST)

        if form.is_valid():
            data = form.cleaned_data
            user = authenticate(request, username=data["user"], password=data["passw"])

            if user is not None:
                login(request, user)
                response = HttpResponse()
                # response.set_cookie('accessName', validatedUser["accessName"].encode('utf-8'))
                # response.set_cookie('accessType', validatedUser["accessType"])
                # response.set_cookie('loggedId', validatedUser["loggedId"])
                # response.set_cookie('shopId', validatedUser["shopId"])
                return response
        
        # Se não foi validado ou não foi encontrado retornar erro
        return HttpResponseBadRequest()

def redefineAccess(request):
    template = loader.get_template('area_barbeiro/esqueceu-senha.html')
    return HttpResponse(template.render())
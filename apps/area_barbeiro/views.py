from django.http import HttpResponse, JsonResponse
from django.shortcuts import render, resolve_url
from django.contrib.auth import authenticate, logout, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.views.generic import View
from django.conf import settings
from django.template import loader
from .link_list import navigation_link_list
from .models import Profile, Shop
from .forms import UserForm
import json, os

@login_required(login_url='/login/')
def main_page(request, shop_id):
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']

    # Gerar text de lista de funções do usuario
    userJobFunctions = ""
    for i, title in enumerate(accessType):
        userJobFunctions += title
        
        # Adicionar separador entre os titulos do usuario
        if i != (len(accessType) - 1):
            userJobFunctions += ' - '

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = navigation_link_list(accessType)

    template = 'area_barbeiro/tela-principal.html'
    context = { 'funcao': userJobFunctions, 'listaLinks': pageLinks }
    return render(request, template, context)

class login_page(View):
    def get(self, request, shop_id):
        form = UserForm()
        template = 'area_barbeiro/acessar/acessar.html'
        context = { "form": form }
        
        return render(request, template, context)

    def post(self, request, shop_id):
        form = UserForm(request.POST)
        
        if form.is_valid():
            data = form.cleaned_data
            user = authenticate(request, username=data["user"], password=data["passw"])

            # Se o usuario é valido, fazer login, e redirecionar
            if user is not None:
                shopId = list(Profile.objects.filter(user=user).values())[0]['shopId']
                login(request, user)

                return JsonResponse({'url': resolve_url('tela_principal'), 'shop_id': shopId, })
        
        # Se não foi validado ou não foi encontrado retornar erro
        return HttpResponse(status=500)

def logoutUser(request, shop_id):
    logout(request)
    return redirect('acessar')

def redefineAccess(request):
    template = loader.get_template('area_barbeiro/esqueceu-senha.html')
    return HttpResponse(template.render())

@login_required(login_url='/login/')
def fluxo_de_caixa(request, shop_id):
    template = 'area_barbeiro/financeiro/fluxo-caixa.html' 
    return render(request, template)

@login_required(login_url='/login/')
def agendamentos(request, shop_id):
    template = 'area_barbeiro/financeiro/gerenciar-horarios.html'
    return render(request, template)

# Telas de Configurações
@login_required(login_url='/login/')
def shop_settings_page(request, shop_id):
    # Obter informações da barbearia
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']
    shopName = list(Shop.objects.filter(id=shop_id).values())[0]['shopName']

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = navigation_link_list(accessType)

    context = {'shopName': shopName , 'listaLinks': pageLinks}
    template = loader.get_template('area_barbeiro/configuracoes/configurar-barbearia.html')
    return HttpResponse(template.render(context, request))

@login_required(login_url='/login/')
def shop_settings_services_page(request, shop_id):
    # Obter informações da barbearia
    userList = list(User.objects.values())
    userInfo = list(Profile.objects.filter(shopId=shop_id).values())
    shopName = list(Shop.objects.filter(id=shop_id).values())


    # Obter informações da barbearia
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = navigation_link_list(accessType)

    # ! Refazer esse loop pois está um cocô
    barberList = []
    for user in userList:
        for info in userInfo:
            if info['user_id'] == user['id']:
                jsoner = json.loads(info['accessType'])['acesso']
                if 'barbeiro' in jsoner:
                    barberList.append({'name': f"{user['username']} {user['last_name']}", 'id': info['user_id']})

    context = { 'barberList': barberList, 'shopName': shopName[0]['shopName'], 'listaLinks': pageLinks}
    print(barberList)
    template = loader.get_template('area_barbeiro/configuracoes/configurar-servicos.html')   
    return HttpResponse(template.render(context, request))

@login_required(login_url='/login/')
def shop_settings_products_page(request, shop_id):# Obter informações da barbearia
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']
    shopName = list(Shop.objects.filter(id=shop_id).values())[0]['shopName']

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = navigation_link_list(accessType)

    context = {'shopName': shopName , 'listaLinks': pageLinks}
    template = loader.get_template('area_barbeiro/configuracoes/configurar-produtos.html')    
    return HttpResponse(template.render(context, request))

# Gerar Lista de Links para a barra lateral
def navigation_link_list(accessType):
    linkList = []

    # Carregar lista de links do JSON
    jsonLinkList = json.loads(open(os.path.join(settings.BASE_DIR, 'apps/area_barbeiro/accessList.json'), encoding='utf-8').read())

    # Mostrar apenas os links se o usuario ter acesso a eles
    for access in jsonLinkList:
        if any(jobTitle in access['acessaSeFor'] for jobTitle in accessType):
            newLinkItem = {'nome': access['nome'], 'link': access['link'], 'icone': access['icone']}
            linkList.append(newLinkItem)

    return linkList
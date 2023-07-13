from django.http import HttpResponse
from django.shortcuts import render, redirect, resolve_url
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.conf import settings
from django.template import loader
from django.urls import reverse
from .link_list import navigation_link_list
from .models import Profile, Shop
from .forms import UserForm
from .extra_functions.extra import redirect_to_correct_shop
import json, os

print('etc')

@login_required(login_url='/login/')
def main_page(request, shop_url):
    # Redirecionar o barbeiro para a barbearia certa
    new_shop_url = redirect_to_correct_shop(shop_url, int(request.COOKIES.get('shopId')))
    if shop_url != new_shop_url:
        return redirect(resolve_url('tela_principal', new_shop_url))

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
    context = { 'funcao': userJobFunctions, 'listaLinks': pageLinks, 'shop_url': shop_url }
    return render(request, template, context)

@login_required(login_url='/login/')
def agendamentos(request, shop_url):
    template = 'area_barbeiro/financeiro/gerenciar-horarios.html'
    return render(request, template)

@login_required(login_url='/login/')
def fluxo_de_caixa(request, shop_url):
    template = 'area_barbeiro/financeiro/fluxo-caixa.html'
    context = {'shop_url': shop_url} 
    return render(request, template, context)

# Telas de Configurações
@login_required(login_url='/login/')
def shop_settings_page(request, shop_url):
    # Obter informações da barbearia
    shop_id = list(Shop.objects.filter(url=shop_url).values())[0].get('id')
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']
    shopName = list(Shop.objects.filter(id=shop_id).values())[0]['shopName']

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = navigation_link_list(accessType)

    context = {'shopName': shopName , 'listaLinks': pageLinks, 'shop_url': shop_url}
    template = loader.get_template('area_barbeiro/configuracoes/configurar-barbearia.html')
    return HttpResponse(template.render(context, request))

@login_required(login_url='/login/')
def shop_settings_services_page(request, shop_url):
    # Obter informações da barbearia
    shop_id = list(Shop.objects.filter(url=shop_url).values())[0].get('id')
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

    context = { 'barberList': barberList, 'shopName': shopName[0]['shopName'], 'listaLinks': pageLinks, 'shop_url': shop_url}
    print(barberList)
    template = loader.get_template('area_barbeiro/configuracoes/configurar-servicos.html')   
    return HttpResponse(template.render(context, request))

@login_required(login_url='/login/')
def shop_settings_products_page(request, shop_url):
    # Obter informações da barbearia
    shop_id = list(Shop.objects.filter(url=shop_url).values())[0].get('id')
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']
    shopName = list(Shop.objects.filter(id=shop_id).values())[0]['shopName']

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = navigation_link_list(accessType)

    context = {'shopName': shopName , 'listaLinks': pageLinks, 'shop_url': shop_url}
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

# Views de Login
def login_page(request, shop_url):
    form = UserForm()
    template = 'area_barbeiro/acessar/acessar.html'
    context = { "form": form }
    
    return render(request, template, context)

def logout_request(request, shop_url):
    logout(request)
    return redirect(reverse('acessar', kwargs={'shop_url': shop_url}))

def forgot_password_page(request):
    template = loader.get_template('area_barbeiro/acessar/esqueceu-senha.html')
    return HttpResponse(template.render())
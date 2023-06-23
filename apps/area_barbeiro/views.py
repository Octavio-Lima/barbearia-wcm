from django.http import HttpResponse, JsonResponse
from django.contrib.auth import authenticate, logout, login
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import redirect
from django.views.generic import View
from .link_list import CreateLinkList
from django.template import loader
from .models import Profile, Shop
from django.conf import settings
import json, os
from .forms import UserForm

@login_required(login_url='/nomebarbearia/acessar/')
def TelaPrincipal(request):
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
    pageLinks = CreateLinkList(accessType)

    context = { 'funcao': userJobFunctions, 'listaLinks': pageLinks }
    template = loader.get_template('area_barbeiro/tela-principal.html')
    return HttpResponse(template.render(context, request))

class loginPage(View):
    def get(self, request):
        form = UserForm()
        template = loader.get_template('area_barbeiro/acessar/acessar.html')
        context = { "form": form }
        
        return HttpResponse(template.render(context, request))

    def post(self, request):
        form = UserForm(request.POST)
        
        if form.is_valid():
            data = form.cleaned_data
            user = authenticate(request, username=data["user"], password=data["passw"])

            if user is not None:
                shopId = list(Profile.objects.filter(user=user).values())[0]['shopId']
                login(request, user)
                response = redirect('tela-principal')
                response.set_cookie('shopId', shopId)
                return response
        
        # Se não foi validado ou não foi encontrado retornar erro
        return JsonResponse({'error': True})

def logoutUser(request):
    logout(request)
    return redirect('acessar')

def redefineAccess(request):
    template = loader.get_template('area_barbeiro/esqueceu-senha.html')
    return HttpResponse(template.render())

@login_required(login_url='/nomebarbearia/acessar/')
def fluxoDeCaixa(request):
    template = loader.get_template('area_barbeiro/financeiro/fluxo-caixa.html')  
    return HttpResponse(template.render())

@login_required(login_url='/nomebarbearia/acessar/')
def Agendamentos(request):
    template = loader.get_template('area_barbeiro/financeiro/gerenciar-horarios.html')  
    return HttpResponse(template.render())

# Create your views here.
@login_required(login_url='/nomebarbearia/acessar/')
def configShop(request):
    # Obter informações da barbearia
    shopId = request.COOKIES.get('shopId')
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']
    shopName = list(Shop.objects.filter(id=shopId).values())[0]['shopName']

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = CreateLinkList(accessType)

    context = {'shopName': shopName , 'listaLinks': pageLinks}
    template = loader.get_template('area_barbeiro/configuracoes/configurar-barbearia.html')
    return HttpResponse(template.render(context, request))

@login_required(login_url='/nomebarbearia/acessar/')
def configService(request):
    # Obter informações da barbearia
    shopId = request.COOKIES.get('shopId')
    userList = list(User.objects.values())
    userInfo = list(Profile.objects.filter(shopId=shopId).values())
    shopName = list(Shop.objects.filter(id=shopId).values())


    # Obter informações da barbearia
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = CreateLinkList(accessType)

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

@login_required(login_url='/nomebarbearia/acessar/')
def configProducts(request):# Obter informações da barbearia
    shopId = request.COOKIES.get('shopId')
    accessData = list(Profile.objects.filter(user=request.user).values())[0]
    accessType = (json.loads(accessData['accessType']))['acesso']
    shopName = list(Shop.objects.filter(id=shopId).values())[0]['shopName']

    # Gerar links para as páginas dependendo do tipo de acesso do usuario
    pageLinks = CreateLinkList(accessType)

    context = {'shopName': shopName , 'listaLinks': pageLinks}
    template = loader.get_template('area_barbeiro/configuracoes/configurar-produtos.html')    
    return HttpResponse(template.render(context, request))

def CreateLinkList(accessType):
    linkList = []

    # Carregar lista de links do JSON
    jsonLinkList = json.loads(open(os.path.join(settings.BASE_DIR, 'apps/area_barbeiro/accessList.json'), encoding='utf-8').read())

    # Mostrar apenas os links se o usuario ter acesso a eles
    for access in jsonLinkList:
        if any(jobTitle in access['acessaSeFor'] for jobTitle in accessType):
            newLinkItem = {'nome': access['nome'], 'link': access['link'], 'icone': access['icone']}
            linkList.append(newLinkItem)

    return linkList
from django.http import HttpResponse
from django.template import loader
from django.shortcuts import redirect
from django.contrib.auth.models import User
from apps.area_barbeiro.models import Profile 
import json

# Create your views here.
def RegisterNewClient(request):
    shop_id = request.COOKIES.get('shopId')
    context = {'barberList': AvailableBarbers(shop_id)}
    template = loader.get_template('area_cliente/cadastrar-clientes.html')
    return HttpResponse(template.render(context, request))

def AvailableBarbers(shopId):
    # Procurar usuario pelo ID da barbearia
    availableBarbers = list(Profile.objects.filter(shopId=shopId).values())
    print(availableBarbers)

    # Se validar, preparar lista
    if (len(availableBarbers) == 0):
        return None
    
    # Gerar Lista de barbeiros
    barberList = []

    for barber in availableBarbers:
        userNames = list(User.objects.filter(id=barber['user_id']).values())[0]
        print(userNames)
        validBarber = {"name": f'{userNames["first_name"]} {userNames["last_name"]}', "id": barber["user_id"]}
        barberList.append(validBarber)

    return barberList

def RedirectToRegister(request):
    return redirect('Cadastrar Clientes')
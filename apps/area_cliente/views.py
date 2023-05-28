from django.http import HttpResponse
from django.template import loader
from apps.area_barbeiro.models import Usuario 
import json

# Create your views here.
def RegisterNewClient(request):
    shop_id = request.COOKIES.get('shopId')
    context = {'barberList': AvailableBarbers(shop_id)}
    template = loader.get_template('area_cliente/cadastrar-clientes.html')
    return HttpResponse(template.render(context, request))

def AvailableBarbers(shopId):
    # Procurar usuario pelo ID da barbearia
    availableBarbers = list(Usuario.objects.filter(shopId=shopId).values())

    # Se validar, preparar lista
    if (len(availableBarbers) == 0):
        return None
    
    # Gerar Lista de barbeiros
    barberList = []

    for barber in availableBarbers:
        validBarber = {"name": barber["name"], "id": barber["id"]}
        barberList.append(validBarber)

    return barberList
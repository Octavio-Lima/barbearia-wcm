from django.http import HttpResponse
from django.template import loader
from apps.cadastros.models import User
import json

# Create your views here.
def RegisterNewClient(request):
    template = loader.get_template('cadastrar-clientes.html')
    context = {'barberList': AvailableBarbers(1)}
    return HttpResponse(template.render(context, request))

def AvailableBarbers(shopId):
    # Procurar usuario pelo ID da barbearia
    availableBarbers = User.objects.filter(shopId=shopId).values()

    # Se validar, preparar lista
    if (len(availableBarbers) > 0):
        # Gerar Lista
        barberList = []

        for barber in availableBarbers:
            validBarber = {"name": barber["name"], "id": barber["accessType"]}
            barberList.append(validBarber)

        # Converter par Json e retornar
        jsonBarberList = json.dumps(str(barberList)).encode('utf-8')
        # print(jsonBarberList)
        return jsonBarberList
    else:
        return False
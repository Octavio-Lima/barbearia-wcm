from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from cadastros.models import User, BarberUserSetting
from configuracoes.models import ShopSettings, ShopProducts
from gerenciar.models import Cliente
import json

# Create your views here.
class ajaxUser(View): 
    def get(self, request):
        # Procurar usuario pelo ID da barbearia
        shopId = request.GET['shopId']
        users = User.objects.filter(shopId=shopId, accessType__icontains='BARBEIRO').values()

        # Enviar como lista
        userList = list(users)
        return JsonResponse(userList, safe=False)
    
    # def post(self, request):
    #     return JsonResponse({'asd': 123})


class ajaxShopConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['ShopID']
        shop = ShopSettings.objects.filter(ShopID=shopId).values()

        shopConfig = list(shop)
        return JsonResponse(shopConfig[0], safe=False)
    
    # def post(self, request):
    #     return JsonResponse({'asd': 123})


class ajaxBarberConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['ShopID']
        barberId = int(request.GET['BarbeiroId']) - 1
        user = BarberUserSetting.objects.filter(ShopID=shopId, BarbeiroId=str(barberId)).values()

        userConfig = list(user)
        return JsonResponse(userConfig[0], safe=False)
    
    # def post(self, request):
    #     return JsonResponse({'asd': 123})


class ajaxProductConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['ShopID']
        product = ShopProducts.objects.filter(ShopID=shopId).values()

        productList = list(product)
        return JsonResponse(productList[0], safe=False)
    
    # def post(self, request):
    #     return JsonResponse({'asd': 123})


class ajaxClients(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        date = request.GET['date']
        schedules = Cliente.objects.filter(dia=date).values()

        scheduleList = list(schedules)
        return JsonResponse(scheduleList, safe=False)
    
    def post(self):
        client = json.loads(self.request.body)
        print(client)

        newClient = Cliente( shopID = client['shopID'],
            barberID = client['barberID'],
            nome = client['name'],
            celular = client['phone'],
            email = client['email'],
            instagram = client['instagram'],
            servicos = client['service'],
            dia = client['date'],
            horaInicio = client['scheduleStart'],
            minuto = client['scheduleMinute'],
            duracao = client['scheduleDuration'],
            valorPagar = client['value'])
        
        newClient.save()

        return JsonResponse({'asd': 123})
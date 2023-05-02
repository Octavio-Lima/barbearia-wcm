from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from cadastros.models import User, BarberUserSetting
from configuracoes.models import ShopSettings, ShopProducts, Shop
from gerenciar.models import Cliente, Lancamento
import json
from datetime import datetime

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
    
    def put(self, request):
        config = json.loads(self.request.body)

        abreAs = datetime.strptime(config["AbreAs"], '%Y-%m-%dT%H:%M:%S.%fZ').time()
        fechaAs = datetime.strptime(config["FechaAs"], '%Y-%m-%dT%H:%M:%S.%fZ').time()

        ShopSettings.objects.filter(ShopID=config['ShopID']).update(
            AbreAs = abreAs,
            FechaAs = fechaAs,
            DiasDeTrabalho = config['DiasDeTrabalho'],
            PrimeiroDiaDaSemana = config['PrimeiroDiaDaSemana']
        )

        return JsonResponse({'': ''})


class ajaxBarberConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['ShopID']
        barberId = request.GET['BarbeiroId']
        user = BarberUserSetting.objects.filter(ShopID=shopId, BarbeiroId=barberId).values()

        print(user)

        userConfig = list(user)
        return JsonResponse(userConfig[0], safe=False)
    
    def put(self, request):
        service = json.loads(self.request.body)

        print(service)

        BarberUserSetting.objects.filter(ShopID=service['shopID'], BarbeiroId=service['barberID']).update(
            ShopID = service['shopID'],
            Serviços = service['serviceList']
        )

        return JsonResponse({'': ''})


class ajaxProductConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['ShopID']
        product = ShopProducts.objects.filter(ShopID=shopId).values()

        productList = list(product)
        return JsonResponse(productList[0], safe=False)
    
    def put(self, request):
        product = json.loads(self.request.body)

        print(product)

        ShopProducts.objects.filter(ShopID=product['ShopID']).update(
            ShopID = product['ShopID'],
            Produtos = product['Produtos']
        )

        return JsonResponse({'': ''})


class ajaxClients(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        date = request.GET['date']
        schedules = Cliente.objects.filter(dia=date).values()

        scheduleList = list(schedules)
        return JsonResponse(scheduleList, safe=False)
    
    def post(self, request):
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


class ajaxShopName(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['shopId']
        shopDetail = Shop.objects.filter(field_id=shopId).values()

        shop = list(shopDetail)
        return JsonResponse(shop[0], safe=False)
    
    # def post(self):
    #     client = json.loads(self.request.body)
    #     print(client)

    #     newClient = Cliente( shopID = client['shopID'],
    #         barberID = client['barberID'],
    #         nome = client['name'],
    #         celular = client['phone'],
    #         email = client['email'],
    #         instagram = client['instagram'],
    #         servicos = client['service'],
    #         dia = client['date'],
    #         horaInicio = client['scheduleStart'],
    #         minuto = client['scheduleMinute'],
    #         duracao = client['scheduleDuration'],
    #         valorPagar = client['value'])
        
    #     newClient.save()

    #     return JsonResponse({'asd': 123})

class ajaxFinancial(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['shopId']
        entries = Lancamento.objects.filter(id_barbearia=shopId).values()

        entriesList = list(entries)
        return JsonResponse(entriesList, safe=False)
    
    def post(self, request):
        entry = json.loads(self.request.body)

        newEntry = Lancamento(nome = entry['nome'],
            tipo = entry['tipo'],
            diaCriado = entry['diaCriado'],
            diaPago = entry['diaPago'],
            criadoPor = entry['criadoPor'],
            valor = entry['valor'],
            formaDePagamento = entry['formaDePagamento'],
            cliente = entry['cliente'],
            id_barbearia = entry['id_barbearia'])
        
        newEntry.save()

        return JsonResponse({'': ''})
    
    def delete(self, request):
        entryId = request.GET['id']
        shopId = request.GET['shopId']
        Lancamento.objects.filter(id_barbearia=shopId, id=entryId).delete()

        return JsonResponse({'': ''})
    
    def put(self, request):
        entry = json.loads(self.request.body)

        date = datetime.strptime(entry["diaPago"], '%Y-%m-%d').date()
        print(date)

        Lancamento.objects.filter(id_barbearia=entry['id_barbearia'], id=entry['id']).update(
            nome = entry['nome'],
            tipo = entry['tipo'],
            diaPago = entry['diaPago'],
            valor = entry['valor'],
            formaDePagamento = entry['formaDePagamento'],
            cliente = entry['cliente'],
        )

        return JsonResponse({'': ''})
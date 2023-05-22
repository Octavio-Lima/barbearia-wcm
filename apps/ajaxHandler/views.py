from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from apps.cadastros.models import User, BarberUserSetting
from apps.configuracoes.models import ShopSetting, ShopProduct, Shop
from apps.gerenciadores.models import Cliente, Lancamento
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
        shopId = request.GET['shopId']
        shop = ShopSetting.objects.filter(shopId=shopId).values()

        shopConfig = list(shop)
        return JsonResponse(shopConfig[0], safe=False)
    
    def put(self, request):
        config = json.loads(self.request.body)

        opensAt = datetime.strptime(config["opensAt"], '%Y-%m-%dT%H:%M:%S.%fZ').time()
        closesAt = datetime.strptime(config["closesAt"], '%Y-%m-%dT%H:%M:%S.%fZ').time()

        ShopSetting.objects.filter(shopId=config['shopId']).update(
            opensAt = opensAt,
            closesAt = closesAt,
            workDays = config['workDays'],
            firstWeekDay = config['firstWeekDay'])

        return JsonResponse({'': ''})

class ajaxBarberConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['shopId']
        barberId = request.GET['barberId']
        userConfig = list(BarberUserSetting.objects.filter(shopId=shopId, barberId=barberId).values())

        print(userConfig)
        return JsonResponse(userConfig[0], safe=False)
    
    def put(self, request):
        service = json.loads(self.request.body)

        print(service)

        BarberUserSetting.objects.filter(shopId=service['shopId'], barberId=service['barberId']).update(
            services = service['services']
        )

        return JsonResponse({'': ''})

class ajaxProductConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['shopId']
        product = ShopProduct.objects.filter(shopId=shopId).values()

        productList = list(product)
        return JsonResponse(productList[0], safe=False)
    
    def put(self, request):
        product = json.loads(self.request.body)

        print(product)

        ShopProduct.objects.filter(shopId=product['shopId']).update(
            shopId = product['shopId'],
            Produtos = product['Produtos']
        )

        return JsonResponse({'': ''})

class ajaxClients(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        date = request.GET['date']
        schedules = Cliente.objects.filter(date=date).values()

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
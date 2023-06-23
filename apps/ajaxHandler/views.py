from django.shortcuts import render
from django.views.generic import View
from django.http import JsonResponse
from apps.area_barbeiro.models import Profile, BarberUserSetting
from apps.area_barbeiro.models import Shop
from apps.area_barbeiro.models import Client, Payment
from apps.ajaxHandler.forms import ShopSettingsForm

import json
from datetime import datetime

# Create your views here.
class ajaxUser(View): 
    def get(self, request):
        # Procurar usuario pelo ID da barbearia
        shopId = request.GET['shopId']
        users = Profile.objects.filter(shopId=shopId, accessType__icontains='BARBEIRO').values()

        # Enviar como lista
        userList = list(users)
        return JsonResponse(userList, safe=False)
    
    # def post(self, request):
    #     return JsonResponse({'asd': 123})

class ajaxShopConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['shopId']
        shop = Shop.objects.filter(id=shopId).values()

        shopConfig = list(shop)
        return JsonResponse(shopConfig[0], safe=False)
    
    def post(self, request):
        form = ShopSettingsForm(request.POST)
        valid = form.is_valid()

        if valid:   
            data = form.cleaned_data

            # Obter informações do formulario
            opensAt = data['opensAt']
            closesAt = data['closesAt']
            firstWeekDay = data['firstDay']

            # Dias em que a barbearia abre
            workDays = ''
            if eval(data['sun']) == True: workDays += 'sun,'
            if eval(data['mon']) == True: workDays += 'mon,'
            if eval(data['tue']) == True: workDays += 'tue,'
            if eval(data['wed']) == True: workDays += 'wed,'
            if eval(data['thu']) == True: workDays += 'thu,'
            if eval(data['fri']) == True: workDays += 'fri,'
            if eval(data['sat']) == True: workDays += 'sat'

            shopId = request.COOKIES.get('shopId')
            Shop.objects.filter(id=shopId).update(
                opensAt = opensAt,
                closesAt = closesAt,
                firstWeekDay = firstWeekDay,
                workDays = workDays)

            return JsonResponse({'': ''})

class ajaxBarberConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        barberId = request.GET['barberId']
        userConfig = list(BarberUserSetting.objects.filter(barberId=barberId).values())

        print(userConfig)
        return JsonResponse(userConfig[0], safe=False)
    
    def put(self, request):
        service = json.loads(self.request.body)
        print(service)
        BarberUserSetting.objects.filter(barberId=service['barberId']).update(
            services = service['services']
        )

        return JsonResponse({'': ''})

class ajaxProductConfig(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        shopId = request.GET['shopId']
        product = Shop.objects.filter(id=shopId).values()

        productList = list(product)
        return JsonResponse(productList[0], safe=False)
    
    def put(self, request):
        productList = json.loads(self.request.body)
        shopId = request.COOKIES.get('shopId')

        Shop.objects.filter(id=shopId).update(
            products = json.dumps(productList)
        )

        return JsonResponse({'': ''})

class ajaxClients(View): 
    def get(self, request):
        # Procurar configuração pelo ID da barbearia
        date = request.GET['date']
        schedules = Client.objects.filter(date=date).values()

        scheduleList = list(schedules)
        return JsonResponse(scheduleList, safe=False)
    
    def post(self, request):
        client = json.loads(self.request.body)
        
        date = datetime.strptime(client['date'], '%Y-%m-%dT%H:%M:%S.%fZ')

        newClient = Client(shopId = client['shopId'],
            barberId = client['barberId'],
            name = client['name'],
            phone = client['phone'],
            email = client['email'],
            instagram = client['instagram'],
            services = client['services'],
            date = date.date(),
            schedule = client['schedule'],
            duration = client['duration'],
            toPay = client['toPay'])
        
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
        entries = Payment.objects.filter(shopId=shopId).values()

        entriesList = list(entries)
        return JsonResponse(entriesList, safe=False)
    
    def post(self, request):
        entry = json.loads(self.request.body)

        newEntry = Payment(nome = entry['nome'],
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
        Payment.objects.filter(id_barbearia=shopId, id=entryId).delete()

        return JsonResponse({'': ''})
    
    def put(self, request):
        entry = json.loads(self.request.body)

        date = datetime.strptime(entry["diaPago"], '%Y-%m-%d').date()
        print(date)

        Payment.objects.filter(id_barbearia=entry['id_barbearia'], id=entry['id']).update(
            nome = entry['nome'],
            tipo = entry['tipo'],
            diaPago = entry['diaPago'],
            valor = entry['valor'],
            formaDePagamento = entry['formaDePagamento'],
            cliente = entry['cliente'],
        )

        return JsonResponse({'': ''})
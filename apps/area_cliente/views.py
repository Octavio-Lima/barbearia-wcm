from django.http import HttpResponse
from django.template import loader
from django.contrib.auth.models import User
from apps.area_barbeiro.models import Profile, Shop 

def register_new_client_page(request, shop_url):
    print(shop_url)
    context = {'barberList': obtain_shop_barber_list(shop_url), 'shop_url': shop_url}
    template = loader.get_template('area_cliente/cadastrar-clientes.html')
    return HttpResponse(template.render(context, request))

def obtain_shop_barber_list(shop_url):
    try:
        # Obter ID da barbearia
        shop_id = list(Shop.objects.filter(url=shop_url).values())[0].get('id')

        # Procurar usuario pelo ID da barbearia
        availableBarbers = list(Profile.objects.filter(shopId=shop_id).values())

        # Se validar, preparar lista
        if (len(availableBarbers) == 0):
            return None
        
        # Gerar Lista de barbeiros
        barberList = []

        for barber in availableBarbers:
            userNames = list(User.objects.filter(id=barber['user_id']).values())[0]
            validBarber = {"name": f'{userNames["first_name"]} {userNames["last_name"]}', "id": barber["user_id"]}
            barberList.append(validBarber)

        return barberList
    except:
        return None
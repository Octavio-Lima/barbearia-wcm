from django.contrib.auth import authenticate, logout, login
from django.http import HttpResponse
from django.shortcuts import redirect, resolve_url
from apps.area_barbeiro.models import Shop

# Verifica se o ID do barbeiro pertence a barbearia, se não pertence, deslogar
def redirect_to_correct_shop(shop_url: int, user_shop_id: int):
    shop_id = list(Shop.objects.filter(url=shop_url).values())[0].get('id')
    print(shop_id, user_shop_id)

    if shop_id == user_shop_id: 
        return shop_url

    # Se o id da barbearia do usuario não for o mesmo da url, redirecionar para a url certa    
    correct_shop_url = list(Shop.objects.filter(id=user_shop_id).values())[0].get('url')
    print(correct_shop_url)
    return correct_shop_url
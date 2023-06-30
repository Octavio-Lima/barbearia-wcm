from django.http import HttpResponse;
from apps.area_barbeiro.models import Shop

# Tela temporaria para escolher barbearia
def list_all_shops_page(request):
    shop_list = list(Shop.objects.all().values('url', 'id'))

    anchor_list = ''
    for shop in shop_list:
        anchor_list += f'<a href="{shop.get("url")}/gerenciar/">id: {shop.get("id")} - {shop.get("url")}</a>'
    
    return HttpResponse(f"<div style='display: flex; flex-direction:column'>{anchor_list}</div>")
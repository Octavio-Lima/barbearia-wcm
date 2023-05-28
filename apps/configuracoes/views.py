from django.http import HttpResponse
from django.template import loader
from apps.area_barbeiro.models import Usuario
from apps.configuracoes.models import Shop

# Create your views here.
def configShop(request):
    template = loader.get_template('configuracoes/configShop.html')
    return HttpResponse(template.render(None, request))

def configService(request):
    shopId = request.COOKIES.get('shopId')

    # Obter informações da barbearia
    barberList = list(Usuario.objects.filter(shopId=shopId).values())
    shopName = list(Shop.objects.filter(field_id=shopId).values())

    context = { 'barberList': barberList, 'shopName': shopName[0]['shopName'] }
    template = loader.get_template('configuracoes/configService.html')   
    return HttpResponse(template.render(context, request))

def configProducts(request):
    template = loader.get_template('configuracoes/configProducts.html')    
    return HttpResponse(template.render())
from django.http import HttpResponse
from django.template import loader

# Create your views here.
def configShop(request):
    template = loader.get_template('configuracoes/configShop.html')
    return HttpResponse(template.render(None, request))

def configService(request):
    template = loader.get_template('configuracoes/configService.html')    
    return HttpResponse(template.render())

def configProducts(request):
    template = loader.get_template('configuracoes/configProducts.html')    
    return HttpResponse(template.render())
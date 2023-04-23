from django.http import HttpResponse
from django.template import loader

def mainpage(request):
    template = loader.get_template('telaprincipal/mainpage.html')
    user = "Fucker"
    acessType = "Fuckerio"
    context = {
        'usuario': user,
        'tipoDeAcesso': acessType,
    }
    
    return HttpResponse(template.render(context, request))
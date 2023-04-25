from django.http import HttpResponse
from django.template import loader

def mainpage(request):
    template = loader.get_template('telaprincipal/mainpage.html')
    user = request.COOKIES.get('accessName')
    acessType = request.COOKIES.get('accessType')
    loggedId = request.COOKIES.get('loggedId')
    context = {
        'usuario': user,
        'tipoDeAcesso': acessType,
        'loggedId': loggedId,
    }
    
    return HttpResponse(template.render(context, request))
from django.http import HttpResponse
from django.template import loader

def login(request):
    template = loader.get_template('cadastros/login.html')
    context = {
        'stupid': "smart",
    }
    
    return HttpResponse(template.render(context, request))
from django.http import HttpResponse
from django.template import loader

# Create your views here.
def RegisterNewClient(request):
    template = loader.get_template('cadastrarcliente/newClient.html')
    return HttpResponse(template.render())
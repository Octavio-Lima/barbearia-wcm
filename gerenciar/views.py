from django.http import HttpResponse
from django.template import loader

def fluxoDeCaixa(request):
    template = loader.get_template('gerenciar/finance-table.html')  
    return HttpResponse(template.render())

def Agendamentos(request):
    template = loader.get_template('gerenciar/manage-schedule.html')  
    return HttpResponse(template.render())
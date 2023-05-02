from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import loader
from .models import User

from .forms import UserForm

def login(request):
    if (request.method == "POST"):
        form = UserForm(request.POST)
        
        if form.is_valid():
            validatedUser = valitadeLogin(form.cleaned_data)

            if (validatedUser == False):
                template = loader.get_template('cadastros/login.html')
                formRequest = {
                    "form": form,
                }
                
                return HttpResponse(template.render(formRequest, request))
            
            print(validatedUser)

            response = HttpResponseRedirect("/mainpage/")
            response.set_cookie('accessName', validatedUser["accessName"].encode('utf-8'))
            response.set_cookie('accessType', validatedUser["accessType"])
            response.set_cookie('loggedId', validatedUser["loggedId"])
            response.set_cookie('shopId', validatedUser["shopId"])
            return response
    else:
        form = UserForm()

    template = loader.get_template('cadastros/login.html')
    formRequest = {
        "form": form,
    }
    
    return HttpResponse(template.render(formRequest, request))

def valitadeLogin(user):
    # Procurar usuario pelo nome e senha
    userQuery = User.objects.filter(username=user["user"], password=user["passw"]).values()

    # Se validar, conceder acesso
    if (len(userQuery) > 0):
        validUser = userQuery[0]
        return {'accessName': validUser["name"], 'accessType': validUser["accessType"], 'loggedId': validUser["id"], 'shopId': validUser["shopId"]}
    else:
        return False
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.template import loader

from .forms import UserForm

def login(request):
    if (request.method == "POST"):
        form = UserForm(request.POST)
        
        if form.is_valid():
            return HttpResponseRedirect("/mainpage/")
    else:
        form = UserForm()

    template = loader.get_template('cadastros/login.html')
    formRequest = {
        "form": form,
    }
    
    return HttpResponse(template.render(formRequest, request))

def valitadeLogin(request):
    # if this is a POST request we need to process the form data
    if request.method == "POST":
        # create a form instance and populate it with data from the request:
        return HttpResponseRedirect("/thanks/")

    # if a GET (or any other method) we'll create a blank form
    else:
        return HttpResponseRedirect("/nani/")

    return render(request, "name.html", {"form": form})
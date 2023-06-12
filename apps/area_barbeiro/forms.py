from django import forms

class UserForm(forms.Form):
    user = forms.CharField(label="E-mail:", max_length=100)
    passw = forms.CharField(label="Senha", max_length=255, widget=forms.PasswordInput())
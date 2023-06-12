from django import forms

class ShopSettingsForm(forms.Form):
    opensAt = forms.CharField(max_length=100, widget=forms.TimeInput())
    closesAt = forms.CharField(max_length=255, widget=forms.TimeInput())
    sun = forms.CharField(max_length=255, widget=forms.CheckboxInput())
    mon = forms.CharField(max_length=255, widget=forms.CheckboxInput())
    tue = forms.CharField(max_length=255, widget=forms.CheckboxInput())
    wed = forms.CharField(max_length=255, widget=forms.CheckboxInput())
    thu = forms.CharField(max_length=255, widget=forms.CheckboxInput())
    fri = forms.CharField(max_length=255, widget=forms.CheckboxInput())
    sat = forms.CharField(max_length=255, widget=forms.CheckboxInput())
    sun = forms.CharField(max_length=255, widget=forms.CheckboxInput())
    firstDay = forms.CharField(max_length=255, widget=forms.RadioSelect())
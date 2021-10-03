# The forms section feel free to put any forms in here

from django.forms import ModelForm
from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import Task, Connection


#user signup form
class SignUpForm(UserCreationForm):
    #birth_date = forms.DateField(help_text='Required. Format: YYYY-MM-DD')

    class Meta:
        model = User
        fields = ('username',
                #'birth_date', 
                'password1', 
                'password2',)

class TaskForm(ModelForm):
    
    class Meta:
        model = Task
        fields = '__all__'
    #Assign task to creator if it is not assigned to someone else.

# class UpdateTaskForm(ModelForm)

#     class Meta:
#         model = Task
#         fields = ('state')
  
#edit user details form
class EditDetailsForm(UserCreationForm):

    class Meta:
        model = User
        fields = ('username','password1','password2',)          


class AddConnectionForm(ModelForm):
    class Meta:
        model = Connection
        fields = ['receiver']


class SearchForm(forms.Form):
    taskid = forms.IntegerField(required=False)
    name = forms.CharField(required=False, max_length=200)
    description = forms.CharField(required=False, max_length=200)
    start_date = forms.DateTimeField(required=False)
    end_date = forms.DateTimeField(required=False)

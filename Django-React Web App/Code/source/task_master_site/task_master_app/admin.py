from django.contrib import admin

# Register your models here.

from .models import Profile, Task, Connection

#admin.site.register(User)
admin.site.register(Task)
admin.site.register(Connection)
admin.site.register(Profile)

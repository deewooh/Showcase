# from django.test import TestCase
# from .models import Profile, Task
# from django.contrib.auth.models import User

# class test_creation(TestCase):
#     def test_successful_creation(self):
#         request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})
#         user1 = Profile.objects.get(id=1)
#         request = self.client.post("/create_task/", {"name": "Task 1", "description": "This is Task 1.","state":"Not Started","AssignedTo": user1,"Duration": 7})
#         assert Task.objects.count() == 1
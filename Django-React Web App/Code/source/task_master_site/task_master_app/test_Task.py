from django.test import TestCase
from .models import Profile, Task
from django.contrib.auth.models import User
from datetime import datetime , timedelta
from .views import tasks

# Integration Test of Task related views that modify the database
class test_Task(TestCase):
    # Checks if correct creation of task gets added to database correctly
    def test_successful_creation(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})        
        user1 = Profile.objects.get(id=1)
        currTime = datetime.now().replace(microsecond=0)
        request = self.client.post("/create_task/", {"name": "Task 1", "description": "This is Task 1.","deadline":currTime.strftime("%Y-%m-%d %-H:%M:%S"), "state":"Not Started", "assigned_to": 1, "duration": 0})
        task = Task.objects.get(id=1)

        assert Task.objects.count() == 1
        assert task.get_name() == "Task 1"
        assert task.get_description() ==  "This is Task 1."
        # 10 Hour timezone in Sydney compared to UTC
        assert task.get_deadline().date() == (currTime - timedelta(hours=10)).date()
        assert task.get_deadline().time() == (currTime - timedelta(hours=10)).time()
        assert task.get_state() == "Not Started"
        assert task.get_assigned_to() == user1
        assert task.get_duration() == 0

    # Checks if task without a deadline is added to database correctly
    def test_successful_creation_no_deadline(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})        
        user1 = Profile.objects.get(id=1)
        currTime = datetime.now()
        request = self.client.post("/create_task/", {"name": "Task 1", "description": "This is Task 1.","deadline":"", "state":"Not Started", "assigned_to": 1, "duration": 0})
        assert Task.objects.count() == 1
        task = Task.objects.get(id=1)
        assert task.get_deadline() == None

    # Checks if changes in tasks are affecting change in database
    def test_update_task(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})        
        user1 = Profile.objects.get(id=1)
        currTime = datetime.now()
        request = self.client.post("/create_task/", {"name": "Task 1", "description": "This is Task 1.","deadline":"", "state":"Not Started", "assigned_to": 1, "duration": 0})
        request = self.client.post("/update_task/1/", {"name": "Changed Task 1", "description": "This is Task 1.","deadline":"2006-10-25 14:30:59", "state":"In Progress", "assigned_to": 1, "duration": 13})
        assert Task.objects.count() == 1
        task = Task.objects.get(id=1)
        assert task.get_name() == "Changed Task 1"
        assert task.get_description() ==  "This is Task 1."
        # 10 Hour timezone in Sydney compared to UTC
        expectedTime = datetime(2006, 10, 25, 14, 30, 59) - timedelta(hours=10)
        assert task.get_deadline().date() == expectedTime.date()
        assert task.get_deadline().time() == expectedTime.time()
        assert task.get_state() == "In Progress"
        assert task.get_assigned_to() == user1
        assert task.get_duration() == 13

    # Checks if deleting task deletes task in database
    def test_delete_task(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})        
        user1 = Profile.objects.get(id=1)
        currTime = datetime.now()
        request = self.client.post("/create_task/", {"name": "Task 1", "description": "This is Task 1.","deadline":"", "state":"Not Started", "assigned_to": 1, "duration": 0})
        assert Task.objects.count() == 1
        self.client.post('/delete_task/1/')
        assert Task.objects.count() == 0
        
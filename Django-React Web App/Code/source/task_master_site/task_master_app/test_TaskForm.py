from django.test import TestCase
from .forms import TaskForm

# Unit Tests to check if SignUpForm returns correct is_valid stats
class test_SignUpForm(TestCase):
    def test_NoDeadline(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})
        form = TaskForm(data={"name": "Task", "description": "This is Task 1.","deadline":"", "state":"Not Started", "assigned_to": 1, "duration": 0})
        assert(form.is_valid())

    def test_validDeadline(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})
        form = TaskForm(data={"name": "Task", "description": "This is Task 1.","deadline":"2026-10-25 14:30:59", "state":"Not Started", "assigned_to": 1, "duration": 0})
        assert(form.is_valid())

    def test_invalidDeadline(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})
        form = TaskForm(data={"name": "Task", "description": "This is Task 1.","deadline":"2026/10/25 14:30:59", "state":"Not Started", "assigned_to": 1, "duration": 0})
        assert(not form.is_valid())
        
    def test_missingname(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})
        form = TaskForm(data={"name": "", "description": "This is Task 1.","deadline":"2026/10/25 14:30:59", "state":"Not Started", "assigned_to": 1, "duration": 0})
        assert(not form.is_valid())
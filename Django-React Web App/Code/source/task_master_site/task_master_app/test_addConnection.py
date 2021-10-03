from django.test import TestCase
from .models import Profile, Connection
from django.contrib.auth.models import User

# Integration test regards to the Connection views 
class test_addConnection(TestCase):
    def test_successful_connection(self):
        # Registers two users named user1 and user2
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})
        request = self.client.post("/signup/", {"username": "user2", "password1":"helloworld123", "password2": "helloworld123"})
        user1 = Profile.objects.get(id=1)
        user2 = Profile.objects.get(id=2)
        assert Profile.objects.count() == 2
        request = self.client.post("/users/user2/add_connection/", {"receiver": 1})
        assert Connection.objects.count() == 1
        connection = Connection.objects.get(receiver=user1)
        assert connection.get_receiver() == user1
        assert connection.get_sender() == user2
        assert str(connection) == "user2 --> user1"
        assert connection.get_status() == False

    # Tests how sending connection to self does not add a connection 
    def test_self_connection(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})
        user1 = Profile.objects.get(id=1)
        request = self.client.post("/users/user2/add_connection/", {"receiver": 1})
        assert Connection.objects.count() == 0

    # Tests how repetitive connection request will not add duplicate connections
    def test_repetitive_connection(self):
        request = self.client.post("/signup/", {"username": "user1", "password1":"helloworld123", "password2": "helloworld123"})
        request = self.client.post("/signup/", {"username": "user2", "password1":"helloworld123", "password2": "helloworld123"})
        request = self.client.post("/users/user2/add_connection/", {"receiver": 1})
        request = self.client.post("/users/user2/add_connection/", {"receiver": 1})
        assert Connection.objects.count() == 1


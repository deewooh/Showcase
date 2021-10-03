from django.test import TestCase
from .models import Profile
from django.contrib.auth.models import User

# Integration test of Profile related views that modify the database.
class test_create_Profile(TestCase):
    # Tests if a profile can be successed correctly
    def test_successful_creation(self):
        assert Profile.objects.count() == 0
        request = self.client.post("/signup/", {"username": "hello@gmail.com", "password1":"helloworld123", "password2": "helloworld123"}, follow=True)
        # Checks if successful Signup redirects to home page
        self.assertRedirects(request, '/')
        # Checks if a profile is created with given values
        assert Profile.objects.count() == 1
        profile = Profile.objects.get(id=1)
        assert(profile.get_name() == "hello@gmail.com")
        assert(profile.get_workload() == 0)

    # Tests One case of failure in test_SignUpForm.py which gives false for isValid
    def test_fail_creation(self):
        request = self.client.post("/signup/", {"username": "hello@gmail.com", "password1":"aa", "password2": "aa"})
        assert Profile.objects.count() == 0
   
    # Tests if editing user details work correctly
    def test_edit_user(self):
        request = self.client.post("/signup/", {"username": "hello@gmail.com", "password1":"helloworld123", "password2": "helloworld123"})
        user = Profile.objects.get(id=1)
        self.client.post("/edit_user/",  data={"username": "newname@gmail.com", "password1":"changedpassword1", "password2": "changedpassword1"})
        assert(user.get_name() == "newname@gmail.com")


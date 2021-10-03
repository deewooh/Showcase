from django.test import TestCase
from .forms import SignUpForm

# Unit test of SignupForm
class test_SignUpForm(TestCase):
    def test_validForm(self):
        form = SignUpForm(data={"username": "hello@gmail.com", "password1":"helloworld123", "password2":"helloworld123"})
        assert(form.is_valid())

    # Checks if incorrect password verification returns invalid form
    def test_invalid_verification(self):
        form = SignUpForm(data={"username": "hello@gmail.com", "password1":"helloworld123", "password2":"goodbye"})
        assert(not form.is_valid())
        
    # Checks if common password returns invalid form
    def test_common_password(self):
        form = SignUpForm(data={"username": "hello@gmail.com", "password1":"password", "password2":"password"})
        assert(not form.is_valid())

    # Checks if username of length more than 150 characters or invalid character returns invalid form
    def test_invalid_username(self):
        proposedUsername = "a" * 151
        assert len(proposedUsername) > 150
        form = SignUpForm(data={"username": proposedUsername, "password1":"helloworld123", "password2":"helloworld123"})
        assert(not form.is_valid())

        proposedUsername = "$$"
        form = SignUpForm(data={"username": proposedUsername, "password1":"helloworld123", "password2":"helloworld123"})
        assert(not form.is_valid())

    # Checks if purely numeric password returns invalid form
    def test_numeric_password(self):
        form = SignUpForm(data={"username": "hello@gmail.com", "password1":"5122134421", "password2":"5122134421"})
        assert(not form.is_valid())

    # Checks if short passwords returns invalid form
    def test_short_password(self):
        form = SignUpForm(data={"username": "hello@gmail.com", "password1":"aa", "password2":"aa"})
        assert(not form.is_valid())

    # Checks if similar password returns invalid form
    def test_personal_password(self):
        form = SignUpForm(data={"username": "hellohello", "password1":"hellohello", "password2":"hellohello"})
        assert(not form.is_valid())
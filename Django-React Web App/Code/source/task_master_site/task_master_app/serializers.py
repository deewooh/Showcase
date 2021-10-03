from django.db.models.query import QuerySet
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import Task, Profile, Connection

# Used to validate our data for certain applications
from rest_framework.validators import UniqueValidator
from django.contrib.auth.password_validation import validate_password

import datetime



# Following code adapted from open source tutorials
# https://www.django-rest-framework.org/api-guide/serializers/?ref=hackernoon.com#declaring-serializers
# https://medium.com/django-rest/django-rest-framework-change-password-and-update-profile-1db0c144c0a3


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        #fields = ('email', 'username', 'password')
        fields = ('id', 'username', 'password')
        extra_kwargs = {'password': {'write_only': True}}


class UserCreateSerializer(serializers.ModelSerializer):
    
    username = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(
                        queryset=User.objects.all(),
                        message="Email already exists"
                    )]
    )
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    class Meta:
        model = User
        #fields = ('email', 'username', 'password')
        fields = ('id', 'username', 'password', 'password2')
    
    def validate(self,attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password2": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data['username'],
        )
        user.set_password(validated_data['password'])
        user.save()

        return user



# Serializer for updating the User's Username
# Update anything but password
class UserUpdateSerializer(serializers.ModelSerializer):
    username = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ('username', 'password')

    def validate_username(self, value):
        user = self.context['request'].user
        if User.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError("This username is already in use.")
        return value

    def validate_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if user.pk != instance.pk:
            raise serializers.ValidationError({"authorize": "You dont have permission for this user."})

        instance.username = validated_data['username']

        instance.save()

        return instance


#Serializer to change the password of User
class UserChangePasswordSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    old_password = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('old_password', 'password', 'password2')

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})

        if attrs['password'] == attrs['old_password']:
            raise serializers.ValidationError({"password": "New password is same as old password"})

        return attrs

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is not correct")
        return value

    def update(self, instance, validated_data):
        user = self.context['request'].user

        if user.pk != instance.pk:
            raise serializers.ValidationError({"authorize": "You dont have permission for this user."})

        instance.set_password(validated_data['password'])
        instance.save()

        return instance


# The main function that serializes the tokens for JWT (our authentication)
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):

    @classmethod
    def get_token(cls, user):
        token = super(MyTokenObtainPairSerializer, cls).get_token(user)

        return token


# This is used to convert tasks into JSON for the front-end
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id', 'name', 'description', 'deadline', 'state', 'assigned_to', 'duration')



class ConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Connection
        fields = ('id', 'receiver', 'sender', 'status')
    
    def to_representation(self, instance):
        representation = super(serializers.ModelSerializer, self).to_representation(instance)
        representation['receiver_username'] = instance.get_receiver().get_name()
        representation['sender_username'] = instance.get_sender().get_name()
        representation['receiver_workload']= instance.get_receiver().get_workload()
        representation['sender_workload']= instance.get_sender().get_workload()

        return representation

# Serializer to get the current User's profile and their workload
class ProfileSerializer(serializers.ModelSerializer):


    class Meta:
        model = Profile
        fields = ('user','workload')


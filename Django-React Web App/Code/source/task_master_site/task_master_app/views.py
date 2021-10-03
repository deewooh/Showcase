from django.shortcuts import render, redirect
from django.http import HttpResponse
from rest_framework.serializers import Serializer
from .models import Profile, Task, Connection
from django.template import loader
from django.urls import reverse

# Imports for the User - functionalities
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from .forms import SignUpForm, TaskForm, EditDetailsForm, AddConnectionForm, SearchForm
from django.contrib.auth.models import User

from django.db.models import Case, When, Value, IntegerField


#Imports for the JWT Authentication
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import MyTokenObtainPairSerializer, UserSerializer, ProfileSerializer,TaskSerializer, ConnectionSerializer
from .serializers import UserChangePasswordSerializer, UserCreateSerializer, UserUpdateSerializer
from rest_framework_simplejwt.tokens import RefreshToken

import datetime
import pytz

from django.http import JsonResponse

# Create your views here.

def index(request):
    return render(request, 'task_master_app/index.html', {'u': request.user})

def tasks(request, user_name):
    #David: First we get the user
    user = User.objects.get(username=user_name)

    #David: Then we get the associated profile
    profile = Profile.objects.get(id=user.profile.id)
    tasks_list = Task.objects.annotate(
        none_last = Case(
            # Create an integer field that is:
            #   0 when deadline exists
            #   1 when deadline is null
            When(deadline__isnull=True, then=Value(1)),
            When(deadline__isnull=False, then=Value(0)),
            output_field = IntegerField()
        )
    ).order_by('none_last', 'deadline', 'name').filter(assigned_to=profile.id)
    # Get the user's list of task objects, ordered by deadline

    context = {
        'profile' : profile,
        'tasks_list' : tasks_list,
    }

    return render(request, 'task_master_app/tasks.html', context)

# David: Main view after user logins in essentially their profile
def user_details(request, user_name):
    #We search for the user
    user = User.objects.get(username=user_name)

    #The we search for the associated profile
    profile = Profile.objects.get(id=user.profile.id)
    workload = profile.get_workload()

    context = {
        'profile' : profile
    }
    return render(request, 'task_master_app/user_details.html', context)

# David: Work in progress -
# This is used to allow users to login and see their tasks
def login_view(request):
    form = AuthenticationForm()
    if request.method=='POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(username = username, password=password)
        if user is not None:
            login(request,user)
            if request.GET.get('next'):
                return redirect(request.GET.get('next'))
            else:
                #A bit of hard-coding here hope to change it later
                return redirect('home')
    
    return render(request, 'task_master_app/login.html', {'form': form})

@login_required
def create_task(request):
    # Creates a task. If owner is not specified, then creator becomes owner. Deadline can be empty
    form = TaskForm()
    if request.method == 'POST':
        form = TaskForm(request.POST)
        if form.is_valid():

            # cur_user = request.user.id
            # task = form.save(commit=False)
            # if task.get_assigned_to() == None:
            #     task.set_assigned_to(cur_user)
            form.save()
            return redirect('tasks', user_name=request.user.get_username())
    return render(request, 'task_master_app/create_task.html', {'form':form, 'profile':request.user.profile})

@login_required
# Update the specified task.
# pk is the primary key of the task that we wish to update.
def update_task(request, pk):
    task = Task.objects.get(id=pk)
    form = TaskForm(instance=task)

    if request.method == 'POST':
        form = TaskForm(request.POST, instance=task)
        if form.is_valid():
            task.save()
            return redirect('tasks', user_name=request.user.get_username())

    context = {'form' : form, 'profile' : request.user.profile}
    return render(request, 'task_master_app/create_task.html', context)

@login_required
def delete_task(request, pk):
    task = Task.objects.get(id=pk)
    if request.method == 'POST':
        task.delete()
        return redirect('tasks', user_name=request.user.get_username())

    context = {'task': task, 'profile': request.user.profile}
    return render(request, 'task_master_app/delete_task.html', context)

@login_required
def logout_user(request):
    logout(request)
    return redirect('login')
    

# David: User signup view
# Used for creating new users
def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            user = form.save()
            user.refresh_from_db()  # load the profile instance created by the signal
            # Add custom fields if we wanted to
            #user.profile.birth_date = form.cleaned_data.get('birth_date')
            user.save()
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=user.username, password=raw_password)
            login(request, user)
            return redirect('home')
    else:
        form = SignUpForm()
    return render(request, 'task_master_app/signup.html', {'form': form})


# Deepan: User edit details view, require user to be logged in for this

# add in search functionality, search for tasks by name, id, description, and/or deadline (between certain dates) 
# case insensitive and trim white space etc
# search through all tasks of own and other task masters connected to


@login_required
# Edit the user details
def edit_user(request):

    # If a button has been pressed    
    if request.method == 'POST':
        # If the "delete" button has been pressed
        if "delete" in request.POST:
            originalUser = request.user.id
            #log out user then delete their account
            logout(request)
            User.objects.filter(id=originalUser).delete()
            return redirect('home')

        form = SignUpForm(request.POST)
        if form.is_valid():
            updatedUser = form.save(commit=False)
            currUser = request.user
            currUser.set_password(updatedUser.password)
            currUser.username = updatedUser.username
            currUser.save() 
            user = authenticate(username = currUser.username, password = currUser.password)
            login(request, user)
            return redirect('home')

    else:
        form = SignUpForm()
    return render(request, 'task_master_app/edit.html', {'form':form, 'profile':request.user.profile})


def search_tasks(request):

    print("Raw Search Parameters: " + str(request.data))

    user = request.user
    profile = Profile.objects.get(id=user.id)
    # get all connections to the user
    connections_list = get_connected_profiles(profile.id)
    # add user themselves onto list for search
    connections_list.append(profile)
    # now create list of all tasks, which we can filter based on search
    searchabletasks = []

    # out of all tasks, get tasks which are assigned to someone in the connections list
    for t in Task.objects.filter():
        if any(x.id == t.assigned_to.id for x in connections_list):
            searchabletasks.append(t)
    
    matchingtasks = []

    # Clean data
    # Get the individual search parameters. At this stage, all parameters are strings.
    taskid = request.data['id']
    name = request.data['name']
    description = request.data['description']
    startDate = request.data['start_date']
    endDate = request.data['end_date']

    # Parameter is empty string '' if not provided in the search
    date_format = '%Y-%m-%d'
    utc = pytz.UTC # Convert offset-naive datetimes to offset-aware datetimes
    if len(taskid) == 0:
        taskid = None
    else:
        taskid = int(taskid)    # taskid is passed in as a string
    if len(name) == 0:
        name = None
    if len(description) == 0:
        description = None
    
    if len(startDate) == 0:
        startDate = None
    else:
        startDate = datetime.datetime.strptime(startDate, date_format)
        startDate = utc.localize(startDate)

    if len(endDate) == 0:
        endDate = None
    else:
        endDate = datetime.datetime.strptime(endDate, date_format)
        endDate = utc.localize(endDate)
    # if only one of start or end date, just +- 100000 days

    print(f"Cleaned Search Parameters: taskid: {taskid}, name: {name}, description: {description}, startDate: {startDate}, endDate: {endDate}")

    # iterate throguh and add in tasks that match criteria
    for t in searchabletasks:
        
        good = True # Tasks begin as matching

        # Match taskid if given
        if taskid is not None:
            if taskid != t.id:
                good = False

        # Match task name if given
        if name is not None and name != "":
            if name not in t.get_name():
                good = False

        # Match task description if given
        if description is not None and description != "":
            if description not in t.get_description():
                good = False

        # Match datetimes if given
        # print(t.get_name(), t.get_deadline(), startDate, endDate)
        if t.get_deadline() is None:
            if startDate is not None or endDate is not None:
                # If a datetime has been given to search, but the task has no deadline
                good = False
        else:
            # Here, tasks have deadlines
            if startDate is not None and endDate is not None:
                # If both start and end datetimes are given
                if not(startDate <= t.get_deadline() and t.get_deadline() <= endDate):
                    good = False
            elif startDate is not None and endDate is None:
                # If only start datetime is given
                if startDate > t.get_deadline():
                    good = False
            elif startDate is None and endDate is not None:
                # If only end datetime is given
                if endDate < t.get_deadline():
                    good = False
            # If both the start and end datetimes are not given, task is matching
            
        # Only append if the task is a matching task
        if good:
            matchingtasks.append(t)

    print("Matching Tasks: " + str(matchingtasks))

    return matchingtasks


@login_required
def add_connection(request, user_name):
    if request.method == 'POST':
        form = AddConnectionForm(request.POST)
        if form.is_valid():
            user_name = request.user.get_username()
            user = User.objects.get(username=user_name)
            profile = Profile.objects.get(id=user.profile.id)
            receiver_profile = Profile.objects.get(id=form['receiver'].value())
            if (user.profile.id == int(form['receiver'].value())) :
                #print('ERROR-SAME USER')
                return render(request, 'task_master_app/add_connection.html', {'form':form, 'profile':request.user.profile})
            if (Connection.objects.filter(sender=profile,receiver=receiver_profile).count() != 0 or Connection.objects.filter(sender=receiver_profile,receiver=profile).count() != 0 ):
                #print('ERROR-REQUEST ALREADY EXISTS')
                return render(request, 'task_master_app/add_connection.html', {'form':form, 'profile':request.user.profile})
            status = False 
            connection = form.save(commit=False)
            connection.set_sender(profile)
            connection.set_status(status)
            connection = form.save()
            return redirect('home')
    else:
        form = AddConnectionForm()
        return render(request, 'task_master_app/add_connection.html', {'form':form, 'profile':request.user.profile})

# Function returns a list of Profiles that are connected to the specified input Profile ID
def get_connected_profiles(profile_id):
    # Get list of connections where "profile_id" was the sender
    sender_list = Connection.objects.filter(sender=profile_id, status=True)
    # Get list of connections where "profil_id" was the receiver
    receiver_list = Connection.objects.filter(receiver=profile_id, status=True)

    # Initialise empty list of connected Profiles
    connections_list = []

    # Append all connected Profiles that was the receiver in the connection request
    for connection in sender_list:
        connections_list.append(connection.get_receiver())

    # Append all connected Profiles that was the sender in the connection request
    for connection in receiver_list:
        connections_list.append(connection.get_sender())

    # Sort the combined list of connected Profiles
    # The optional argument "key" specifies a function on which to perform the sorting.
    # The lambda function is inputted elements of "connections_list", which are Profiles.
    # Then, the lambda function returns the name of the Profile, which is used as the key.
    # Ultimately, we're sorting this list of Profiles alphabetically by their "name" field.
    connections_list = sorted(connections_list, key = lambda x : x.get_name())

    return connections_list

@login_required
def connections(request, user_name):
    # Get the User object
    user = User.objects.get(username=user_name)
    # Get the Profile object
    profile = Profile.objects.get(id=user.profile.id)

    # Get the list of connected Profiles
    connections_list = get_connected_profiles(profile.id)

    # Get the incoming pending Connections
    incoming_list = Connection.objects.filter(receiver=profile.id, status=False).order_by('sender__user__username')

    # Define variables for the HTML
    context = {
        'profile_nav' : request.user.profile,   # Testing 
        'profile' : profile,
        'connections_list' : connections_list,
        'incoming_list' : incoming_list,
    }

    return render(request, 'task_master_app/connections.html', context)

@login_required
def pending(request, user_name, connection_id):
    # Get the relevant objects
    user = User.objects.get(username=user_name)
    profile = Profile.objects.get(id=user.profile.id)
    connection = Connection.objects.get(id=connection_id)

    if request.method == 'POST':
        # If a button has been pressed
        if request.POST.get("accept_btn"):
            # Confirm the connection
            connection.set_status(True)
            connection.save()
        elif request.POST.get("decline_btn"):
            # Delete the connection request
            connection.delete()

        # Return to the user's list of connections
        return redirect('connections', user_name=user_name)
    else:
        # No button has been pressed yet

        # Define variables for the HTML
        context = {
            'profile' : profile,
            'connection' : connection,
        }

        return render(request, 'task_master_app/pending.html', context)




# JWT Authentication Views
class ObtainTokenPair(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = MyTokenObtainPairSerializer



class CurrentUser(APIView):

    def get(self, request, format=None):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class UserWorkload(APIView):

    def get(self, request, format=None):
        profile = Profile.objects.get(user = request.user)
        profile.get_workload()
        serializers = ProfileSerializer(profile)
        return Response(serializers.data)


class WorkloadView(generics.RetrieveAPIView):
    lookup_field = 'user'
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    #queryset = Profile.objects.all()
    def get_queryset(self):
        user = self.request.user
        profile = Profile.objects.get(user = user)
        profile.get_workload()
        return(Profile.objects.all())



class UserCreate(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request, format='json'):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if user:
                json = serializer.data
                return Response(json, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserInfoUpdate(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = UserUpdateSerializer


class UserPasswordUpdate(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class =UserChangePasswordSerializer


class UserDelete(generics.DestroyAPIView):
    queryset = User.objects.all()
    #permission_classes = (permissions.AllowAny,)
    serializer_class = UserSerializer

class LogoutAndBlacklistRefreshTokenForUserView(APIView):
    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()

    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)





# Views for the corresponding serialisizers in serializers.py
# This view will return all the tasks of the current user
# Current user is passed in through request.user
# From the frontend it comes through via an Authorization header
class TaskViewReact(viewsets.ModelViewSet):
    permission_classes = (permissions.AllowAny,)
    
    
    serializer_class = TaskSerializer
    queryset = Task.objects.all()

    # Overide the default get_queryset() function and filter all the tasks
    # by just the current user
    def get_queryset(self):
        #queryset = super().get_queryset() 
        return Task.objects.annotate(
            none_last = Case(
                # Create an integer field that is:
                #   0 when deadline exists
                #   1 when deadline is null
                When(deadline__isnull=True, then=Value(1)),
                When(deadline__isnull=False, then=Value(0)),
                output_field = IntegerField()
            )
        ).order_by('none_last', 'deadline', 'name').filter(assigned_to=self.request.user.id)


class ConnectionTaskView(APIView):
    permission_classes = (permissions.AllowAny,)
    # serializer_class = TaskSerializer
    #queryset = Task.objects.all()

    def post(self, request, format='json'):
        print(request.data)
        query_set = Task.objects.annotate(
            none_last = Case(
                # Create an integer field that is:
                #   0 when deadline exists
                #   1 when deadline is null
                When(deadline__isnull=True, then=Value(1)),
                When(deadline__isnull=False, then=Value(0)),
                output_field = IntegerField()
            )
        ).order_by('none_last', 'deadline', 'name').filter(assigned_to = request.data['assigned_to'])

        serializer = TaskSerializer(query_set, many=True)
        
        return Response(serializer.data)



class TasksSearchViewReact(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request, format='json'):
        queryset = search_tasks(request)
        
        #serializer_class = TaskSerializer
        serializer = TaskSerializer(queryset, many=True)
        
        return Response(serializer.data)

class ConnectionConfirmViewReact(APIView):
    permission_classes = (permissions.AllowAny,)
    def put(self, request, connection_id):
        willAccept = request.data.get("willAccept")
        c = Connection.objects.get(id=connection_id)
        if (willAccept):
            c.set_status(True)
            c.save()
            return Response(status=status.HTTP_200_OK)
        else:
            c.delete()
            return Response(status=status.HTTP_200_OK)



class createConnectionReact(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request):
        queryset = User.objects.all()
        serializer = UserSerializer(queryset,many=True)
        return Response(serializer.data)

    def post(self, request):
        requestTo = request.data.get("requestTo")
        requestFrom = request.data.get("requestFrom")
        requestTo_user = User.objects.get(username=requestTo).id
        requestFrom_user = User.objects.get(username=requestFrom).id
        
        if (requestTo == requestFrom):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        if (Connection.objects.filter(sender=requestTo_user,receiver=requestFrom_user).count() != 0 or Connection.objects.filter(sender=requestFrom_user,receiver=requestTo_user).count() != 0 ):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        else:
            form = AddConnectionForm({"receiver":Profile.objects.get(id = requestTo_user)})
            connection = form.save(commit=False)
            connection.set_sender(Profile.objects.get(id = requestFrom_user))
            connection.set_status(False)
            connection = form.save()
            
            return Response(status=status.HTTP_200_OK)

class getConnectionsReact(APIView):
    permission_classes = (permissions.AllowAny,)
    def get(self, request):
        queryset = Connection.objects.all()
        serializer = ConnectionSerializer(queryset,many=True)
        return Response(serializer.data)
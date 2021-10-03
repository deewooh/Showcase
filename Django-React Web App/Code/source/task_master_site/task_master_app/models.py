from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
import datetime as dt
import pytz
#from dateutil.parser import parse



# Here is our main Profile model
# We inherit from the model.Model to add functionalties
# We then also establish a one-to-one relationship with
# Djangos built in 'User' object which holds username, password, etc
# this will allow for us to add in a login feature
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    workload = models.IntegerField(default=0)

    #Pretty much these following functions enable a "Profile" to be
    # created when a User is created on the signup step
    @receiver(post_save, sender=User)
    def create_user_profile(sender, instance, created, **kwargs):
        if created:
            Profile.objects.create(user=instance, workload=0)

    @receiver(post_save, sender=User)
    def save_user_profile(sender, instance, **kwargs):
        instance.profile.save()
     
    def __str__(self):
        return self.user.username

    def get_name(self):
        return self.user.username

    def get_email(self):
        return self.user.email
    
    def calculate_points(self, tasks):
        points = 0

        for t in tasks:
            if t.get_deadline() is not None:
                #
                if str(t.get_state()) == "Not Started":
                    points = points + t.get_duration()
                
                elif str(t.get_state()) == "In Progress":
                    points = points + (t.get_duration() * 0.5)

                elif str(t.get_state()) == "Blocked":
                    points = points + (t.get_duration()*0.33)

        return points


    def get_workload(self):
    # tasks = Task.objects.filter(assigned_to = self.user.id)
        # you will need to first 'import pytz' at the top
        # declare your timezone
        timezone = pytz.timezone('Australia/Sydney') 

        # get your naive time
        currDate_naive = dt.datetime.now()
        #convert to a time aware to use for the search       
        currDate_aware = timezone.localize(currDate_naive)
        
        # End of week 1
        endWeek1_naive = currDate_naive + dt.timedelta(7)
        endWeek1_aware = timezone.localize(endWeek1_naive)

        # End of week 2
        endWeek2_naive = endWeek1_naive + dt.timedelta(7)
        endWeek2_aware = timezone.localize(endWeek2_naive)

        
        user_tasks = Task.objects.filter(assigned_to = self.user.id)
        # Calculate the baseline workload with all the tasks with no deadline
        tasks_no_deadline = user_tasks.filter(deadline=None)
        tasks_no_deadline_count = tasks_no_deadline.count()
        t0 = 0
        if(tasks_no_deadline_count > 0):
            t0 = float(6-(4/tasks_no_deadline_count))
        
        total = 0.0


        # Get all the task due in 7 days they
        tasks = user_tasks.filter(deadline__gt=currDate_aware, deadline__lt=endWeek1_aware)
        total = total + self.calculate_points(tasks)
        
        # Get all the task due between 8-14 days, scaled by 0.75
        tasks2 = user_tasks.filter(deadline__gt=endWeek1_aware, deadline__lt=endWeek2_aware)
        total = total + (self.calculate_points(tasks2)*0.60)

        # All tasks beyond two weeks scaled by 0.45
        tasks3 = user_tasks.filter(deadline__gt=endWeek1_aware, deadline__lt=endWeek2_aware)
        total = total + (self.calculate_points(tasks3)*0.25)


        # Now normalize the value, denominator is a based on 5 days of 8 hours of work 
        # Convert it into a percentage
        normalized = ((t0+total)/40)*100

        self.workload = int(normalized)
        #self.workload = tasks.count()
        self.save()
        return self.workload

    def set_name(self, new_name):
        self.name = new_name


class Task(models.Model):
    STATUS = (('Not Started', 'Not Started'), ('In Progress', 'In Progress'), ('Blocked', 'Blocked'), ('Completed', 'Completed'))
    name = models.CharField(max_length=200)
    description = models.TextField(max_length=200)
    deadline = models.DateTimeField(null=True, blank=True)
    state = models.CharField(max_length=200, choices=STATUS, default="Not Started")
    assigned_to = models.ForeignKey(Profile, on_delete=models.CASCADE, default=None)
    # duration is number of days task will take
    duration = models.PositiveIntegerField(default=0)
    # creation_date = models.DateTimeField()
    
    def __str__(self):
        return f"[{self.id}] {self.name}"

    def get_name(self):
        return self.name

    def get_description(self):
        return self.description
    
    def get_deadline(self):
        return self.deadline

    def get_state(self):
        return self.state

    def get_assigned_to(self):
        return self.assigned_to

    def get_duration(self):
        return self.duration

    def set_name(self, new_name):
        self.name = new_name

    def set_description(self, new_description):
        self.description = new_description

    def set_deadline(self, new_deadline):
        self.deadline = new_deadline
    
    def set_state(self, new_state):
        self.state = new_state
    
    def set_assigned_to(self, new_user):
        self.assigned_to = new_user

    def set_duration(self, new_duration):
        self.duration = new_duration


class Connection(models.Model):
    sender = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='sender')
    receiver = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='receiver')
    status = models.BooleanField(default=False)
    # status = 0 means the connection/ request is pending
    # status = 1 means the connection/ request has been confirmed by the receiver

    def __str__(self):
        if self.status:
            return str(self.sender) + " <==> " + str(self.receiver)
        else:
            return str(self.sender) + " --> " + str(self.receiver)

    def get_sender(self):
        return self.sender
    
    def get_receiver(self):
        return self.receiver
    
    def get_status(self):
        return self.status

    def set_status(self, new_status):
        self.status = new_status
        

    def set_receiver(self, new_receiver):
        self.receiver = new_receiver

    def set_sender(self, new_sender):
        self.sender = new_sender


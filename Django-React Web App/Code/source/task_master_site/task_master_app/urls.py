from django.urls import path
from . import views

# JWT Front-end library
from rest_framework_simplejwt import views as jwt_views


# app_name = 'task_master_app'
urlpatterns = [
    #For the URLS we pass in the username
    path('users/<str:user_name>/', views.user_details, name='user_details'),
    path('users/<str:user_name>/tasks/', views.tasks, name='tasks'),
    path('users/<str:user_name>/add_connection/', views.add_connection, name='add_connection'),
    path('users/<str:user_name>/connections/', views.connections, name='connections'),
    path('users/<str:user_name>/connections/pending/<int:connection_id>/', views.pending, name='pending'),
    path('login/', views.login_view, name='login'),
    path('signup/', views.signup, name='signup'),
    path('edit_user/', views.edit_user, name='edit_user'),
    path('logout/', views.logout_user, name='logout'),
    path('create_task/', views.create_task, name='create_task'),
    path('update_task/<str:pk>/', views.update_task, name='update_task'),
    path('delete_task/<str:pk>/', views.delete_task, name='delete_task'),
    path('task_search/', views.search_tasks, name='search_tasks'),

    # JWT Authentication URLS
    path('api/token/obtain/', views.ObtainTokenPair.as_view(), name='token_create'),  # override sjwt stock token
    path('api/token/refresh/', jwt_views.TokenRefreshView.as_view(), name='token_refresh'),
    path('api/blacklist/', views.LogoutAndBlacklistRefreshTokenForUserView.as_view(), name='blacklist'),
    
    # Front end method of creating a new user
    path('api/user/create/', views.UserCreate.as_view(), name="create_user"),

    # Front end method of getting current user
    path('api/current/', views.CurrentUser.as_view(), name="current user"),

    path('api/user_workload/', views.UserWorkload.as_view(), name="current user"),

    path('api/workload/<int:user>/', views.WorkloadView.as_view(), name="current profile"),

    #Front end method of updating user details
    path('api/update_profile/<int:pk>/', views.UserInfoUpdate.as_view(), name='update_profile'),

    #Front end method of updating user password
    path('api/update_password/<int:pk>/', views.UserPasswordUpdate.as_view(), name='update_password'),

    #Front end method of deleting user
    path('api/delete_user/<int:pk>/', views.UserDelete.as_view(), name='delete_account'),

    path('api/tasks_search/', views.TasksSearchViewReact.as_view(), name='get_searched_tasks'),


    path('api/connections/<int:connection_id>/', views.ConnectionConfirmViewReact.as_view()),

    path('api/createConnection/', views.createConnectionReact.as_view()),
    
    path('api/connections/', views.getConnectionsReact.as_view()),

    path('api/connections_tasks/', views.ConnectionTaskView.as_view()),

   
]
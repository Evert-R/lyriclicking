from django.urls import path, reverse_lazy

from . import views

app_name = 'accounts'
urlpatterns = [
    path('login/', views.log_in, name='log_in'),
    path('logout/', views.log_out, name='log_out'),
    path('register/', views.register_user, name='register_user')

]

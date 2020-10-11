from django.urls import path

from . import views

app_name = 'lyrics'
urlpatterns = [
    path('add/', views.add_line, name='add_line'),
]

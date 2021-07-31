from django.urls import path

from . import views

app_name = 'lyriclicker'

urlpatterns = [
    path('', views.lyric_licker, name='lyric_licker')
]

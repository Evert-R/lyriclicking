from django.urls import path

from . import views

app_name = 'lyrics'
urlpatterns = [
    path('lick/', views.lick_lyric, name='lick_lyric'),
    path('delete/', views.delete_line, name='delete_line'),
    path('setendpoint/', views.set_endpoint, name='set_endpoint'),
]

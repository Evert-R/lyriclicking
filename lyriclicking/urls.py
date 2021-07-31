"""lyriclicking URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path
from django.views import static
from django.conf.urls.static import static
from django.conf import settings
from django.contrib.auth import views as auth_views
from accounts.forms import ResetPasswordForm, PasswordSetForm

urlpatterns = [
    path('admin/', admin.site.urls),
    path('lyriclicker/', include('lyriclicker.urls')),
    path('lyrics/', include('lyrics.urls')),
    path('accounts/', include('accounts.urls')),

    path('reset_password/',
         auth_views.PasswordResetView.as_view(
             form_class=ResetPasswordForm,
             template_name='resetpassword.html'),
         name='reset_password'),

    path('reset_password_sent/',
         auth_views.PasswordResetDoneView.as_view(
             template_name='passwordsent.html'),
         name="password_reset_done"),

    path('reset/<uidb64>/<token>/',
         auth_views.PasswordResetConfirmView.as_view(
             form_class=PasswordSetForm,
             template_name='setpassword.html'),
         name="password_reset_confirm"),

    path('reset_password_complete/',
         auth_views.PasswordResetCompleteView.as_view(
             template_name='passwordset.html'),
         name="password_reset_complete"),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

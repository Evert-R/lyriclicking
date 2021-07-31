from django.shortcuts import render, redirect, reverse,  get_object_or_404
from django.http import HttpRequest
from django.contrib import auth, messages
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User, Group
from accounts.forms import LogInForm, RegisterForm, UserUpdateForm


# from accounts import decorators
# Create your views here.


def register_user(request):
    """Register new users"""
    # Get request origin to pass to the form
    next = request.GET.get('next', '/')
    accounts_form = RegisterForm()
    # check if a form was submitted
    if request.method == 'POST':
            # Get request origin from form
        next = request.POST.get('next', '/')
        # Create form object with submitted data
        accounts_form = RegisterForm(request.POST)
        if accounts_form.is_valid():
            # when valid save user to the database
            user = accounts_form.save()
            username = accounts_form.cleaned_data.get('username')
            # Display success message
            auth.login(user=user, request=request)
            messages.success(
                request, 'You are now registered and logged in as ' + username)
            # Return to request origin
            return redirect(next)
    # Show the register page
    return render(request, 'register.html',
                  {'accounts_form': accounts_form,
                   'next': next,
                   'title': 'Please register to use the webshop'})


def log_in(request):
    """Show login page"""
    # Get request origin
    next = request.GET.get('next', '/')
    accounts_form = LogInForm()
    if request.user.is_authenticated:
        messages.error(request, 'You are already logged in !')
        return redirect(reverse('work_space'))
    # check if a form was submitted
    if request.method == 'POST':
        # Get request origin from form
        next = request.POST.get('next', '/')
        # Create form object with submitted data
        accounts_form = LogInForm(request.POST)
        if accounts_form.is_valid():
            # when valid authenticate the user
            user = auth.authenticate(username=request.POST['username'],
                                     password=request.POST['password'])
            if user is not None:
                # When a user is matched log in
                auth.login(user=user, request=request)
                # Display success message
                messages.success(request, "You are now logged in!")
                # redirect to request origin
                return redirect(next)
            else:
                # When user was not matched return the form with errors
                accounts_form.add_error(
                    None, "Your username or password is incorrect")
    # Show the login page
    return render(request, 'login.html',
                  {'accounts_form': accounts_form,
                   'title': 'Please login to use the webshop',
                   'next': next})


@login_required
def log_out(request):
    """Log out user"""
    # Get request origin
    next = request.GET.get('next', '/')
    # Log user out
    auth.logout(request)
    messages.success(request, "You are now logged out!")
    # return to request origin
    return redirect(next)

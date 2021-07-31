from django import forms
from django.forms import ModelForm
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm, PasswordResetForm, SetPasswordForm
from django.core.exceptions import ValidationError
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Fieldset, ButtonHolder, Submit, Field, LayoutObject


class LogInForm(forms.Form):
    """Log users in"""

    username = forms.CharField()
    password = forms.CharField(widget=forms.PasswordInput)

    def __init__(self, *args, **kwargs):
        super(LogInForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.form_tag = False
        self.helper.add_input(
            Submit('submit', 'Log in', css_class='er-green'))


class RegisterForm(UserCreationForm):
    """Register users"""

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name',
                  'email', 'password1', 'password2']

    # check if a user with this email already exists
    def clean(self):
        email = self.cleaned_data.get('email')
        if User.objects.filter(email=email).exists():
            raise ValidationError(
                "There already is an account using this email address")
        return self.cleaned_data

    def __init__(self, *args, **kwargs):
        super(RegisterForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.help_text_inline = True
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'er-form-label'
        self.helper.field_class = 'er-form-field'
        self.helper.add_input(
            Submit('submit', 'Register', css_class='er-green'))


class UserUpdateForm(ModelForm):
    """Update user"""

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name',
                  'email']

    def __init__(self, *args, **kwargs):
        super(UserUpdateForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.help_text_inline = True
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'er-form-label'
        self.helper.field_class = 'er-form-field'
        self.helper.add_input(
            Submit('submit', 'Submit', css_class='er-green'))


class ResetPasswordForm(PasswordResetForm):
    """Let users reset their password"""

    class Meta:
        model = User
        fields = ['email']

    def __init__(self, *args, **kwargs):
        super(ResetPasswordForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.help_text_inline = True
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'er-form-label'
        self.helper.field_class = 'er-form-field'
        self.helper.add_input(
            Submit('submit', 'Reset my password', css_class='er-red'))


class PasswordSetForm(SetPasswordForm):
    """Let users reset their password"""

    class Meta:
        model = User
        fields = ['password1', 'password2']

    def __init__(self, *args, **kwargs):
        super(PasswordSetForm, self).__init__(*args, **kwargs)
        self.helper = FormHelper(self)
        self.helper.help_text_inline = True
        self.helper.form_tag = False
        self.helper.form_class = 'form-horizontal'
        self.helper.label_class = 'er-form-label'
        self.helper.field_class = 'er-form-field'
        self.helper.add_input(
            Submit('submit', 'Reset my password', css_class='er-green'))

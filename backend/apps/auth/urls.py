from django.urls import path

from .views import (
    login_view,
    logout_view,
    me_view,
    password_reset_confirm_view,
    password_reset_view,
    register_view,
    verify_2fa_view,
)

urlpatterns = [
    path('register/', register_view, name='register'),
    path('login/', login_view, name='login'),
    path('login/verify/', verify_2fa_view, name='login_verify_2fa'),
    path('password-reset/', password_reset_view, name='password_reset'),
    path('password-reset/confirm/', password_reset_confirm_view, name='password_reset_confirm'),
    path('logout/', logout_view, name='logout'),
    path('me/', me_view, name='me'),
]

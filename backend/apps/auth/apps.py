"""Конфигурация Django-приложения авторизации."""

from django.apps import AppConfig


class AuthConfig(AppConfig):
    """Настройки приложения ``apps.auth``.

    Приложение хранит 2FA-коды и предоставляет JSON API авторизации.
    """

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.auth'
    label = 'accounts'

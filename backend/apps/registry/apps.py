"""Конфигурация Django-приложения реестра дипломов."""

from django.apps import AppConfig


class RegistryConfig(AppConfig):
    """Настройки приложения ``apps.registry``.

    Приложение хранит вузы, студентов, дипломы и журнал проверок.
    """

    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.registry'

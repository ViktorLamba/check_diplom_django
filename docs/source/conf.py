"""Конфигурация Sphinx для документации сервиса проверки дипломов."""

import os
import sys
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / 'backend'
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
os.environ.setdefault('DB_NAME', 'django_docs')
os.environ.setdefault('DB_USER', 'django_docs')
os.environ.setdefault('DB_PASSWORD', 'django_docs')
os.environ.setdefault('DB_HOST', 'localhost')
os.environ.setdefault('DB_PORT', '5432')

try:
    import django

    django.setup()
except Exception as exc:
    raise RuntimeError(
        'Не удалось инициализировать Django для Sphinx autodoc. '
        'Установите зависимости проекта и проверьте переменные окружения.'
    ) from exc

project = 'Сервис проверки дипломов'
author = 'Команда проекта'
copyright = '2026, Команда проекта'

extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.autosectionlabel',
    'sphinx.ext.napoleon',
]

templates_path = ['_templates']
exclude_patterns = []

language = 'ru'
html_theme = 'alabaster'
html_static_path = ['_static']
autosectionlabel_prefix_document = True
autodoc_member_order = 'bysource'
autodoc_typehints = 'description'

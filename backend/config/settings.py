"""Настройки Django для проекта config."""

from pathlib import Path
import os

# Базовая директория проекта.
BASE_DIR = Path(__file__).resolve().parent.parent


# Базовые настройки разработки.

# В продакшене ключ должен задаваться через переменные окружения.
SECRET_KEY = 'django-insecure-mr3l6v2j&_*$v8muri790v^mhv!sqo-f2v&z_mdhcuikbb8nc$'

# В продакшене DEBUG должен быть выключен.
DEBUG = True

ALLOWED_HOSTS = []


# Подключенные приложения.

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'apps.auth.apps.AuthConfig',
    'diplomas',
    'rest_framework',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'


# База данных.

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'diplom_db',
        'USER': 'diplom_user',
        'PASSWORD': 'diplom_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}


# Валидаторы паролей.

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Локализация.

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Статические файлы.

STATIC_URL = 'static/'

""" Часть добавленная семеном если кто то будет возмущтася , не звоните """
DIPLOMA_HASH_SALT = os.environ.get('DIPLOMA_HASH_SALT', 'default-salt-change-me')
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
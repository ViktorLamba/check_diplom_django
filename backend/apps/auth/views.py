import json
import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET, require_POST

from .models import TwoFactorCode

User = get_user_model()


def _parse_json_body(request):
    try:
        body = request.body.decode('utf-8') if request.body else '{}'
        return json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def _user_payload(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
    }


@require_POST
def register_view(request):
    if not request.user.is_authenticated or not request.user.is_staff:
        return JsonResponse({'detail': 'Только администратор может регистрировать пользователей.'}, status=403)

    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    username = (data.get('username') or '').strip()
    email = (data.get('email') or '').strip()
    password = data.get('password') or ''
    password_confirm = data.get('password_confirm') or ''

    if not username or not email or not password or not password_confirm:
        return JsonResponse({'detail': 'Поля username, email, password и password_confirm обязательны.'}, status=400)

    if password != password_confirm:
        return JsonResponse({'detail': 'Пароли не совпадают.'}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({'detail': 'Пользователь с таким username уже существует.'}, status=400)

    if User.objects.filter(email=email).exists():
        return JsonResponse({'detail': 'Пользователь с таким email уже существует.'}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        is_staff=False,
    )
    return JsonResponse({'detail': 'Пользователь создан администратором.', 'user': _user_payload(user)}, status=201)


@require_POST
def login_view(request):
    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username or not password:
        return JsonResponse({'detail': 'Поля username и password обязательны.'}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is None:
        return JsonResponse({'detail': 'Неверные учетные данные.'}, status=401)

    if user.is_staff or user.is_superuser:
        login(request, user)
        return JsonResponse({'detail': 'Вход выполнен.', 'user': _user_payload(user)}, status=200)

    TwoFactorCode.objects.filter(user=user, is_used=False).update(is_used=True)
    code = f'{random.randint(0, 999999):06d}'
    expires_at = timezone.now() + timedelta(minutes=10)
    TwoFactorCode.objects.create(user=user, code=code, expires_at=expires_at)

    response_payload = {
        'detail': 'Код двухфакторной аутентификации отправлен. Подтвердите вход на /api/auth/login/verify/.',
        'requires_2fa': True,
        'username': user.username,
    }
    if settings.DEBUG:
        response_payload['code_debug'] = code

    return JsonResponse(response_payload, status=200)


@require_POST
def verify_2fa_view(request):
    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    username = (data.get('username') or '').strip()
    code = (data.get('code') or '').strip()

    if not username or not code:
        return JsonResponse({'detail': 'Поля username и code обязательны.'}, status=400)

    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({'detail': 'Пользователь не найден.'}, status=404)

    tf_code = (
        TwoFactorCode.objects
        .filter(user=user, code=code, is_used=False, expires_at__gt=timezone.now())
        .order_by('-created_at')
        .first()
    )
    if tf_code is None:
        return JsonResponse({'detail': 'Неверный или просроченный 2FA код.'}, status=401)

    tf_code.is_used = True
    tf_code.save(update_fields=['is_used'])

    login(request, user)
    return JsonResponse({'detail': 'Вход подтвержден.', 'user': _user_payload(user)}, status=200)


@require_POST
def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

    logout(request)
    return JsonResponse({'detail': 'Выход выполнен.'}, status=200)


@require_GET
def me_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

    return JsonResponse({'user': _user_payload(request.user)}, status=200)

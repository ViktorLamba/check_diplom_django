"""JSON API для входа, выхода, 2FA и управления паролем."""

import json
import random
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model, login, logout, update_session_auth_hash
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.core.exceptions import ValidationError
from django.core.mail import send_mail
from django.http import JsonResponse
from django.utils import timezone
from django.utils.encoding import DjangoUnicodeDecodeError, force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.views.decorators.http import require_GET, require_POST

from .models import TwoFactorCode

User = get_user_model()

PASSWORD_RESET_DETAIL = 'Если пользователь с таким email существует, письмо для восстановления пароля отправлено.'


def _parse_json_body(request):
    """Вернуть JSON-тело запроса или ``None`` при ошибке разбора."""

    try:
        body = request.body.decode('utf-8') if request.body else '{}'
        return json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def _user_payload(user):
    """Сформировать JSON-представление пользователя с ролью в системе."""

    university = getattr(user, 'university', None)
    student = getattr(user, 'student', None)

    if user.is_staff or user.is_superuser:
        role = 'admin'
    elif university is not None:
        role = 'university'
    elif student is not None:
        role = 'student'
    else:
        role = 'user'

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': role,
        'universityId': university.id if university is not None else None,
        'universityName': university.name if university is not None else None,
        'studentId': student.id if student is not None else None,
        'studentName': student.full_name if student is not None else None,
    }


@require_POST
def register_view(request):
    """Создать обычного пользователя от имени администратора.

    Доступ разрешен только авторизованному staff-пользователю. Ожидает поля
    ``username``, ``email``, ``password`` и ``password_confirm``.
    """

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
def password_reset_view(request):
    """Отправить письмо со ссылкой восстановления пароля.

    Метод всегда возвращает нейтральный ответ, чтобы не раскрывать наличие
    пользователя с переданным email.
    """

    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    email = (data.get('email') or '').strip()
    user = User.objects.filter(email=email).first() if email else None

    if user is not None:
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f'{settings.FRONTEND_URL.rstrip("/")}/reset-password?uid={uid}&token={token}'

        send_mail(
            subject='Восстановление пароля',
            message=(
                f'Здравствуйте, {user.username}.\n\n'
                'Для восстановления пароля перейдите по ссылке:\n'
                f'{reset_url}\n\n'
                'Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=False,
        )

    return JsonResponse({'detail': PASSWORD_RESET_DETAIL}, status=200)


@require_POST
def password_reset_confirm_view(request):
    """Установить новый пароль по ``uid`` и ``token`` из письма."""

    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    uid = data.get('uid') or ''
    token = data.get('token') or ''
    password = data.get('password') or ''
    password_confirm = data.get('passwordConfirm') or ''

    if password != password_confirm:
        return JsonResponse({'detail': 'Пароли не совпадают.'}, status=400)

    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist, ValidationError, DjangoUnicodeDecodeError):
        return JsonResponse({'detail': 'Некорректная ссылка восстановления пароля.'}, status=400)

    if not default_token_generator.check_token(user, token):
        return JsonResponse({'detail': 'Некорректная ссылка восстановления пароля.'}, status=400)

    try:
        validate_password(password, user=user)
    except ValidationError as error:
        return JsonResponse({'detail': error.messages}, status=400)

    user.set_password(password)
    user.save()

    return JsonResponse({'detail': 'Пароль успешно изменён.'}, status=200)


@require_POST
def change_password_view(request):
    """Сменить пароль текущего авторизованного пользователя."""

    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    old_password = data.get('oldPassword') or ''
    new_password = data.get('newPassword') or ''
    new_password_confirm = data.get('newPasswordConfirm') or ''

    if not request.user.check_password(old_password):
        return JsonResponse({'detail': 'Старый пароль указан неверно.'}, status=400)

    if new_password != new_password_confirm:
        return JsonResponse({'detail': 'Пароли не совпадают.'}, status=400)

    try:
        validate_password(new_password, user=request.user)
    except ValidationError as error:
        return JsonResponse({'detail': error.messages}, status=400)

    request.user.set_password(new_password)
    request.user.save()
    update_session_auth_hash(request, request.user)

    return JsonResponse({'detail': 'Пароль успешно изменён.'}, status=200)


@require_POST
def login_view(request):
    """Выполнить вход пользователя.

    Администратор получает сессию сразу. Для пользователя вуза или студента
    создается одноразовый 2FA-код и отправляется на email.
    """

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

    if not user.email:
        return JsonResponse({'detail': 'У пользователя не указан email для получения кода 2FA.'}, status=400)

    TwoFactorCode.objects.filter(user=user, is_used=False).update(is_used=True)
    code = f'{random.randint(0, 999999):06d}'
    expires_at = timezone.now() + timedelta(minutes=10)
    TwoFactorCode.objects.create(user=user, code=code, expires_at=expires_at)

    send_mail(
        subject='Код входа (2FA)',
        message=(
            f'Здравствуйте, {user.username}.\n\n'
            f'Ваш код подтверждения входа: {code}\n'
            'Код действует 10 минут.'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        fail_silently=False,
    )

    return JsonResponse(
        {
            'detail': 'Код двухфакторной аутентификации отправлен. Подтвердите вход на /api/auth/login/verify/.',
            'requires_2fa': True,
            'username': user.username,
        },
        status=200,
    )


@require_POST
def verify_2fa_view(request):
    """Подтвердить 2FA-код и создать пользовательскую сессию."""

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
    """Завершить текущую пользовательскую сессию."""

    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

    logout(request)
    return JsonResponse({'detail': 'Выход выполнен.'}, status=200)


@require_GET
def me_view(request):
    """Вернуть данные текущего авторизованного пользователя."""

    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

    return JsonResponse({'user': _user_payload(request.user)}, status=200)

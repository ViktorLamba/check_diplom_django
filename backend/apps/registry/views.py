import json
from datetime import date
from secrets import token_urlsafe

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from django.core.paginator import EmptyPage, Paginator
from django.db import IntegrityError, transaction
from django.db.models import Count, Q
from django.http import HttpResponse, JsonResponse
from django.utils.dateparse import parse_date
from django.views.decorators.http import require_http_methods

from .models import Diploma, Student, University

User = get_user_model()


def _parse_json_body(request):
    try:
        body = request.body.decode('utf-8') if request.body else '{}'
        return json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def _current_university(request):
    if not request.user.is_authenticated:
        return None, JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

    university = getattr(request.user, 'university', None)
    if university is None:
        return None, JsonResponse({'detail': 'Доступно только пользователю вуза.'}, status=403)

    return university, None


def _current_student(request):
    if not request.user.is_authenticated:
        return None, JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

    student = getattr(request.user, 'student', None)
    if student is None:
        return None, JsonResponse({'detail': 'Доступно только студенту.'}, status=403)

    return student, None


def _require_admin(request):
    if not request.user.is_authenticated:
        return JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

    if not request.user.is_staff and not request.user.is_superuser:
        return JsonResponse({'detail': 'Доступно только администратору.'}, status=403)

    return None


def _positive_int(value, default, max_value=None):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default

    if parsed < 1:
        return default
    if max_value is not None:
        return min(parsed, max_value)
    return parsed


def _student_payload(student):
    return {
        'id': student.id,
        'userId': student.user_id,
        'fullName': student.full_name,
        'email': student.email,
        'group': student.group,
        'course': student.course,
        'diplomasCount': getattr(student, 'diplomas_count', student.diplomas.count()),
        'status': student.status,
        'createdAt': student.created_at.date().isoformat(),
    }


def _university_payload(university):
    return {
        'id': university.id,
        'userId': university.user_id,
        'name': university.name,
        'username': university.user.username,
        'email': university.user.email,
        'createdAt': university.created_at.date().isoformat(),
    }


def _diploma_payload(diploma):
    return {
        'id': diploma.id,
        'publicId': str(diploma.public_id),
        'number': diploma.number,
        'studentId': diploma.student_id,
        'owner': diploma.student.full_name,
        'universityId': diploma.university_id,
        'universityName': diploma.university.name,
        'speciality': diploma.speciality,
        'qualification': diploma.qualification,
        'issuedAt': diploma.issued_at.isoformat(),
        'status': diploma.status,
        'qrCodeUrl': diploma.qr_code_url,
        'verificationUrl': f'/diplom/{diploma.public_id}',
        'verificationApiUrl': f'/api/diplom/{diploma.public_id}/',
    }


def _diploma_verification_payload(diploma):
    payload = _diploma_payload(diploma)
    payload['verificationStatus'] = 'verified' if diploma.status == Diploma.STATUS_VALID else diploma.status
    payload['verificationMessage'] = (
        'Диплом верифицирован.'
        if diploma.status == Diploma.STATUS_VALID
        else 'Диплом найден, но не является действующим.'
    )
    return payload


def _diploma_verification_response(diploma):
    verified = diploma.status == Diploma.STATUS_VALID
    return {
        'verified': verified,
        'verificationStatus': 'verified' if verified else diploma.status,
        'verificationMessage': (
            'Диплом верифицирован.'
            if verified
            else 'Диплом найден, но не является действующим.'
        ),
        'verificationUrl': f'/diplom/{diploma.public_id}',
        'verificationApiUrl': f'/api/diplom/{diploma.public_id}/',
        'diploma': _diploma_verification_payload(diploma),
    }


def _paginated_response(queryset, request, payload_factory):
    page = _positive_int(request.GET.get('page'), 1)
    page_size = _positive_int(request.GET.get('page_size'), 10, max_value=100)
    paginator = Paginator(queryset, page_size)

    try:
        page_obj = paginator.page(page)
    except EmptyPage:
        page_obj = paginator.page(paginator.num_pages or 1)

    return JsonResponse(
        {
            'count': paginator.count,
            'results': [payload_factory(item) for item in page_obj.object_list],
        },
        status=200,
    )


@require_http_methods(['GET', 'POST'])
def universities_view(request):
    error = _require_admin(request)
    if error is not None:
        return error

    if request.method == 'GET':
        universities = list(University.objects.select_related('user').order_by('name', 'id'))
        search = (request.GET.get('search') or '').strip()
        if search:
            search_lower = search.lower()
            universities = [
                university for university in universities
                if search_lower in university.name.lower()
                or search_lower in university.user.username.lower()
                or search_lower in university.user.email.lower()
            ]

        return _paginated_response(universities, request, _university_payload)

    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    username = (data.get('username') or '').strip()
    password = token_urlsafe(12)

    if not name or not email or not username:
        return JsonResponse({'detail': 'Поля name, email и username обязательны.'}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=False,
            )
            university = University.objects.create(
                user=user,
                name=name,
            )
    except IntegrityError:
        return JsonResponse({'detail': 'Вуз или пользователь с такими данными уже существует.'}, status=400)

    send_mail(
        subject='Доступ к личному кабинету вуза',
        message=(
            f'Здравствуйте.\n\n'
            f'Для вуза "{name}" создан доступ к личному кабинету.\n'
            f'Логин: {username}\n'
            f'Пароль: {password}\n'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

    return JsonResponse(_university_payload(university), status=201)


@require_http_methods(['PUT', 'PATCH', 'DELETE'])
def university_detail_view(request, university_id):
    error = _require_admin(request)
    if error is not None:
        return error

    university = University.objects.filter(id=university_id).select_related('user').first()
    if university is None:
        return JsonResponse({'detail': 'Вуз не найден.'}, status=404)

    if request.method == 'DELETE':
        user = university.user
        student_user_ids = list(
            university.students.exclude(user__isnull=True).values_list('user_id', flat=True)
        )
        university.delete()
        if student_user_ids:
            User.objects.filter(id__in=student_user_ids).delete()
        if user is not None:
            user.delete()
        return HttpResponse(status=204)

    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    username = (data.get('username') or '').strip()

    if not name or not email or not username:
        return JsonResponse({'detail': 'Поля name, email и username обязательны.'}, status=400)

    try:
        with transaction.atomic():
            university.name = name
            university.user.email = email
            university.user.username = username
            university.user.save(update_fields=['email', 'username'])
            university.save(update_fields=['name'])
    except IntegrityError:
        return JsonResponse({'detail': 'Вуз или пользователь с такими данными уже существует.'}, status=400)

    return JsonResponse(_university_payload(university), status=200)


@require_http_methods(['GET', 'POST'])
def students_view(request):
    university, error = _current_university(request)
    if error is not None:
        return error

    if request.method == 'GET':
        students = (
            Student.objects
            .filter(university=university)
            .annotate(diplomas_count=Count('diplomas'))
            .order_by('-created_at', '-id')
        )

        search = (request.GET.get('search') or '').strip()
        status = (request.GET.get('status') or '').strip()
        if status:
            if status not in dict(Student.STATUS_CHOICES):
                return JsonResponse({'detail': 'Некорректный статус студента.'}, status=400)
            students = students.filter(status=status)

        if search:
            search_lower = search.lower()
            students = [
                student for student in students
                if search_lower in student.full_name.lower()
                or search_lower in student.email.lower()
                or search_lower in student.group.lower()
            ]

        return _paginated_response(students, request, _student_payload)

    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    full_name = (data.get('fullName') or '').strip()
    email = (data.get('email') or '').strip()
    group = (data.get('group') or '').strip()
    course = data.get('course')
    username = (data.get('username') or '').strip()
    password = token_urlsafe(12)

    if not full_name or not email or not username or not group or course in (None, ''):
        return JsonResponse({'detail': 'Поля fullName, email, username, group и course обязательны.'}, status=400)

    try:
        course = int(course)
    except (TypeError, ValueError):
        return JsonResponse({'detail': 'Поле course должно быть числом.'}, status=400)

    if course < 1 or course > 6:
        return JsonResponse({'detail': 'Поле course должно быть от 1 до 6.'}, status=400)

    try:
        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                is_staff=False,
            )
            student = Student.objects.create(
                university=university,
                user=user,
                full_name=full_name,
                email=email,
                group=group,
                course=course,
            )
    except IntegrityError:
        return JsonResponse({'detail': 'Студент или пользователь с такими данными уже существует.'}, status=400)

    send_mail(
        subject='Доступ к личному кабинету студента',
        message=(
            f'Здравствуйте, {full_name}.\n\n'
            'Для вас создан доступ к личному кабинету студента.\n'
            f'Логин: {username}\n'
            f'Пароль: {password}\n'
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )

    student.diplomas_count = 0
    payload = _student_payload(student)
    payload['username'] = user.username
    return JsonResponse(payload, status=201)


@require_http_methods(['PUT', 'PATCH', 'DELETE'])
def student_detail_view(request, student_id):
    university, error = _current_university(request)
    if error is not None:
        return error

    student = Student.objects.filter(id=student_id, university=university).select_related('user').first()
    if student is None:
        return JsonResponse({'detail': 'Студент не найден.'}, status=404)

    if request.method in ('PUT', 'PATCH'):
        data = _parse_json_body(request)
        if data is None:
            return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

        full_name = (data.get('fullName') or '').strip()
        email = (data.get('email') or '').strip()
        group = (data.get('group') or '').strip()
        course = data.get('course')
        status = (data.get('status') or '').strip()

        if not full_name or not email or not group or course in (None, '') or not status:
            return JsonResponse(
                {'detail': 'Поля fullName, email, group, course и status обязательны.'},
                status=400,
            )

        try:
            course = int(course)
        except (TypeError, ValueError):
            return JsonResponse({'detail': 'Поле course должно быть числом.'}, status=400)

        if course < 1 or course > 6:
            return JsonResponse({'detail': 'Поле course должно быть от 1 до 6.'}, status=400)

        if status not in dict(Student.STATUS_CHOICES):
            return JsonResponse({'detail': 'Некорректный статус студента.'}, status=400)

        try:
            with transaction.atomic():
                student.full_name = full_name
                student.email = email
                student.group = group
                student.course = course
                student.status = status
                student.save(update_fields=['full_name', 'email', 'group', 'course', 'status'])

                if student.user is not None:
                    student.user.email = email
                    student.user.save(update_fields=['email'])
        except IntegrityError:
            return JsonResponse({'detail': 'Студент с таким email уже существует в этом вузе.'}, status=400)

        student.diplomas_count = student.diplomas.count()
        return JsonResponse(_student_payload(student), status=200)

    user = student.user
    student.delete()
    if user is not None:
        user.delete()

    return HttpResponse(status=204)


@require_http_methods(['GET', 'POST'])
def diplomas_view(request):
    if request.method == 'GET':
        if not request.user.is_authenticated:
            return JsonResponse({'detail': 'Требуется аутентификация.'}, status=401)

        diplomas = (
            Diploma.objects
            .select_related('student', 'university')
            .order_by('-issued_at', '-id')
        )

        university = getattr(request.user, 'university', None)
        if request.user.is_staff or request.user.is_superuser:
            pass
        elif university is not None:
            diplomas = diplomas.filter(university=university)
        else:
            return JsonResponse({'detail': 'Доступно только администратору или пользователю вуза.'}, status=403)

        search = (request.GET.get('search') or '').strip()
        if search:
            diplomas = diplomas.filter(
                Q(number__icontains=search)
                | Q(student__full_name__icontains=search)
                | Q(university__name__icontains=search)
                | Q(speciality__icontains=search)
                | Q(qualification__icontains=search)
            )

        status = (request.GET.get('status') or '').strip()
        if status:
            if status not in dict(Diploma.STATUS_CHOICES):
                return JsonResponse({'detail': 'Некорректный статус диплома.'}, status=400)
            diplomas = diplomas.filter(status=status)

        return _paginated_response(diplomas, request, _diploma_payload)

    university, error = _current_university(request)
    if error is not None:
        return error

    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    student_id = data.get('studentId')
    number = (data.get('number') or '').strip()
    speciality = (data.get('speciality') or '').strip()
    qualification = (data.get('qualification') or '').strip()
    issued_at_raw = (data.get('issuedAt') or '').strip()

    if not student_id or not number or not speciality or not qualification or not issued_at_raw:
        return JsonResponse(
            {'detail': 'Поля studentId, number, speciality, qualification и issuedAt обязательны.'},
            status=400,
        )

    issued_at = parse_date(issued_at_raw)
    if not isinstance(issued_at, date):
        return JsonResponse({'detail': 'Поле issuedAt должно быть датой в формате YYYY-MM-DD.'}, status=400)

    try:
        student = Student.objects.get(id=student_id, university=university)
    except (Student.DoesNotExist, ValueError, TypeError):
        return JsonResponse({'detail': 'Студент не найден.'}, status=404)

    try:
        diploma = Diploma.objects.create(
            university=university,
            student=student,
            number=number,
            speciality=speciality,
            qualification=qualification,
            issued_at=issued_at,
        )
    except IntegrityError:
        return JsonResponse({'detail': 'Диплом с таким номером уже существует в этом вузе.'}, status=400)

    diploma = Diploma.objects.select_related('student', 'university').get(id=diploma.id)
    return JsonResponse(_diploma_payload(diploma), status=201)


@require_http_methods(['POST'])
def diploma_verify_view(request):
    data = _parse_json_body(request)
    if data is None:
        return JsonResponse({'detail': 'Некорректное тело JSON.'}, status=400)

    series = (data.get('series') or '').strip()
    number = (data.get('number') or '').strip()
    issued_at_raw = (data.get('issuedAt') or '').strip()

    if not number or not issued_at_raw:
        return JsonResponse({'detail': 'Поля number и issuedAt обязательны.'}, status=400)

    issued_at = parse_date(issued_at_raw)
    if not isinstance(issued_at, date):
        return JsonResponse({'detail': 'Поле issuedAt должно быть датой в формате YYYY-MM-DD.'}, status=400)

    possible_numbers = [number]
    if series:
        possible_numbers.extend([
            f'{series}{number}',
            f'{series} {number}',
            f'{series}-{number}',
        ])

    diploma = (
        Diploma.objects
        .select_related('student', 'university')
        .filter(number__in=possible_numbers, issued_at=issued_at)
        .first()
    )
    if diploma is None:
        return JsonResponse(
            {
                'verified': False,
                'verificationStatus': 'not_found',
                'verificationMessage': 'Диплом не найден.',
                'diploma': None,
            },
            status=404,
        )

    return JsonResponse(_diploma_verification_response(diploma), status=200)


@require_http_methods(['GET'])
def public_diploma_view(request, public_id):
    diploma = (
        Diploma.objects
        .select_related('student', 'university')
        .filter(public_id=public_id)
        .first()
    )
    if diploma is None:
        return JsonResponse(
            {
                'verified': False,
                'verificationStatus': 'not_found',
                'verificationMessage': 'Диплом не найден.',
                'diploma': None,
            },
            status=404,
        )

    return JsonResponse(_diploma_verification_response(diploma), status=200)


@require_http_methods(['GET'])
def my_diplomas_view(request):
    student, error = _current_student(request)
    if error is not None:
        return error

    diplomas = (
        Diploma.objects
        .select_related('student', 'university')
        .filter(student=student)
        .order_by('-issued_at', '-id')
    )
    return _paginated_response(diplomas, request, _diploma_payload)

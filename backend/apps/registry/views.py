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

from .models import Diploma, Student

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


def _diploma_payload(diploma):
    return {
        'id': diploma.id,
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


@require_http_methods(['DELETE'])
def student_detail_view(request, student_id):
    university, error = _current_university(request)
    if error is not None:
        return error

    student = Student.objects.filter(id=student_id, university=university).select_related('user').first()
    if student is None:
        return JsonResponse({'detail': 'Студент не найден.'}, status=404)

    user = student.user
    student.delete()
    if user is not None:
        user.delete()

    return HttpResponse(status=204)


@require_http_methods(['GET', 'POST'])
def diplomas_view(request):
    university, error = _current_university(request)
    if error is not None:
        return error

    if request.method == 'GET':
        diplomas = (
            Diploma.objects
            .select_related('student', 'university')
            .filter(university=university)
            .order_by('-issued_at', '-id')
        )

        search = (request.GET.get('search') or '').strip()
        if search:
            diplomas = diplomas.filter(
                Q(number__icontains=search)
                | Q(student__full_name__icontains=search)
                | Q(speciality__icontains=search)
                | Q(qualification__icontains=search)
            )

        status = (request.GET.get('status') or '').strip()
        if status:
            if status not in dict(Diploma.STATUS_CHOICES):
                return JsonResponse({'detail': 'Некорректный статус диплома.'}, status=400)
            diplomas = diplomas.filter(status=status)

        return _paginated_response(diplomas, request, _diploma_payload)

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

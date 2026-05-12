import json

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import Client, TestCase

from .models import Diploma, Student, University

User = get_user_model()


class RegistryApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            username='msu',
            email='msu@example.com',
            password='StrongPass123',
        )
        self.university = University.objects.create(
            user=self.user,
            name='МГУ им. М. В. Ломоносова',
        )

        self.other_user = User.objects.create_user(
            username='spbu',
            email='spbu@example.com',
            password='StrongPass123',
        )
        self.other_university = University.objects.create(
            user=self.other_user,
            name='СПбГУ',
        )

        self.client.force_login(self.user)

    def test_students_are_filtered_by_current_user_university(self):
        own_student = Student.objects.create(
            university=self.university,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        Student.objects.create(
            university=self.other_university,
            full_name='Петров Петр Петрович',
            email='petrov@student.spbu.ru',
            group='ПМ-101',
            course=1,
        )

        response = self.client.get('/api/students/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['id'], own_student.id)

    def test_create_student_ignores_university_id_from_frontend(self):
        response = self.client.post(
            '/api/students/',
            data=json.dumps(
                {
                    'fullName': 'Сидорова Анна Сергеевна',
                    'email': 'sidorova@student.msu.ru',
                    'username': 'sidorova',
                    'group': 'ИВТ-402',
                    'course': 4,
                    'universityId': self.other_university.id,
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        student = Student.objects.get(email='sidorova@student.msu.ru')
        self.assertEqual(student.university, self.university)
        self.assertIsNotNone(student.user)
        self.assertEqual(student.user.username, 'sidorova')
        self.assertEqual(response.json()['userId'], student.user_id)
        self.assertEqual(response.json()['username'], 'sidorova')
        self.assertNotIn('temporaryPassword', response.json())
        self.assertEqual(response.json()['diplomasCount'], 0)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['sidorova@student.msu.ru'])
        self.assertIn('Логин: sidorova', mail.outbox[0].body)
        self.assertIn('Пароль:', mail.outbox[0].body)

    def test_create_student_ignores_explicit_credentials_and_emails_generated_password(self):
        response = self.client.post(
            '/api/students/',
            data=json.dumps(
                {
                    'fullName': 'Петрова Анна Сергеевна',
                    'email': 'petrova@student.msu.ru',
                    'username': 'petrova',
                    'password': 'StudentPass123',
                    'group': 'ИВТ-403',
                    'course': 4,
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()['username'], 'petrova')
        self.assertNotIn('temporaryPassword', response.json())
        user = User.objects.get(username='petrova')
        self.assertFalse(user.check_password('StudentPass123'))
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Логин: petrova', mail.outbox[0].body)

    def test_search_and_status_filters_students(self):
        Student.objects.create(
            university=self.university,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        Student.objects.create(
            university=self.university,
            full_name='Смирнов Алексей Олегович',
            email='smirnov@student.msu.ru',
            group='ИВТ-402',
            course=4,
            status=Student.STATUS_INACTIVE,
        )

        response = self.client.get('/api/students/?search=иванов&status=active&page=1&page_size=10')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['fullName'], 'Иванов Иван Иванович')

    def test_delete_student_only_inside_current_university(self):
        other_student = Student.objects.create(
            university=self.other_university,
            full_name='Петров Петр Петрович',
            email='petrov@student.spbu.ru',
            group='ПМ-101',
            course=1,
        )

        response = self.client.delete(f'/api/students/{other_student.id}/')

        self.assertEqual(response.status_code, 404)
        self.assertTrue(Student.objects.filter(id=other_student.id).exists())

    def test_create_diploma_uses_current_user_university(self):
        student = Student.objects.create(
            university=self.university,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )

        response = self.client.post(
            '/api/diplomas/',
            data=json.dumps(
                {
                    'studentId': student.id,
                    'number': 'DIP-2026-005',
                    'speciality': 'Информатика',
                    'qualification': 'Бакалавр',
                    'issuedAt': '2026-05-10',
                    'universityId': self.other_university.id,
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload['studentId'], student.id)
        self.assertEqual(payload['owner'], 'Иванов Иван Иванович')
        self.assertEqual(payload['universityId'], self.university.id)
        self.assertEqual(payload['universityName'], self.university.name)
        self.assertEqual(payload['status'], 'valid')
        self.assertIsNone(payload['qrCodeUrl'])

        diploma = Diploma.objects.get(number='DIP-2026-005')
        self.assertEqual(diploma.university, self.university)

    def test_cannot_create_diploma_for_student_from_another_university(self):
        other_student = Student.objects.create(
            university=self.other_university,
            full_name='Петров Петр Петрович',
            email='petrov@student.spbu.ru',
            group='ПМ-101',
            course=1,
        )

        response = self.client.post(
            '/api/diplomas/',
            data=json.dumps(
                {
                    'studentId': other_student.id,
                    'number': 'DIP-2026-006',
                    'speciality': 'Математика',
                    'qualification': 'Бакалавр',
                    'issuedAt': '2026-05-10',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 404)
        self.assertFalse(Diploma.objects.filter(number='DIP-2026-006').exists())

    def test_diplomas_are_filtered_by_current_user_university(self):
        own_student = Student.objects.create(
            university=self.university,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        other_student = Student.objects.create(
            university=self.other_university,
            full_name='Петров Петр Петрович',
            email='petrov@student.spbu.ru',
            group='ПМ-101',
            course=1,
        )
        Diploma.objects.create(
            university=self.university,
            student=own_student,
            number='DIP-2026-001',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        Diploma.objects.create(
            university=self.other_university,
            student=other_student,
            number='DIP-2026-002',
            speciality='Математика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )

        response = self.client.get('/api/diplomas/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['number'], 'DIP-2026-001')

    def test_student_can_view_only_own_diplomas(self):
        student_user = User.objects.create_user(
            username='ivanov',
            email='ivanov@student.msu.ru',
            password='StrongPass123',
        )
        student = Student.objects.create(
            university=self.university,
            user=student_user,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        other_student = Student.objects.create(
            university=self.university,
            full_name='Смирнов Алексей Олегович',
            email='smirnov@student.msu.ru',
            group='ИВТ-402',
            course=4,
        )
        Diploma.objects.create(
            university=self.university,
            student=student,
            number='DIP-2026-010',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        Diploma.objects.create(
            university=self.university,
            student=other_student,
            number='DIP-2026-011',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        self.client.force_login(student_user)

        response = self.client.get('/api/diplomas/my/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['number'], 'DIP-2026-010')

    def test_student_cannot_access_university_diplomas_module(self):
        student_user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )
        Student.objects.create(
            university=self.university,
            user=student_user,
            full_name='Иванов Иван Иванович',
            email='student@example.com',
            group='ИВТ-401',
            course=4,
        )
        self.client.force_login(student_user)

        response = self.client.get('/api/diplomas/')

        self.assertEqual(response.status_code, 403)

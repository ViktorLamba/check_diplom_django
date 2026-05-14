import json
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.core import mail
from django.test import Client, TestCase
from django.utils import timezone

from .models import Diploma, DiplomaVerificationLog, Student, University

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

    def test_public_stats_available_without_auth(self):
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
        diploma = Diploma.objects.create(
            university=self.university,
            student=student,
            number='MSU-001',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        DiplomaVerificationLog.objects.create(
            diploma=diploma,
            university=self.university,
            source=DiplomaVerificationLog.SOURCE_FORM,
            verification_status=DiplomaVerificationLog.STATUS_VERIFIED,
            verified=True,
        )
        yesterday_log = DiplomaVerificationLog.objects.create(
            diploma=diploma,
            university=self.university,
            source=DiplomaVerificationLog.SOURCE_PUBLIC,
            verification_status=DiplomaVerificationLog.STATUS_VERIFIED,
            verified=True,
        )
        DiplomaVerificationLog.objects.filter(id=yesterday_log.id).update(
            created_at=timezone.now() - timedelta(days=1),
        )

        self.client.logout()
        response = self.client.get('/api/public/stats/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {
                'universitiesCount': 2,
                'usersCount': 3,
                'diplomasCount': 1,
                'checksTodayCount': 1,
            },
        )

    def test_users_list_requires_admin_or_university(self):
        self.client.logout()
        response_without_auth = self.client.get('/api/users/')

        self.assertEqual(response_without_auth.status_code, 401)

        student_user = User.objects.create_user(
            username='ivanov',
            email='ivanov@student.msu.ru',
            password='StrongPass123',
        )
        Student.objects.create(
            university=self.university,
            user=student_user,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        self.client.force_login(student_user)
        response = self.client.get('/api/users/')

        self.assertEqual(response.status_code, 403)

    def test_admin_can_list_users_with_search_and_role_filter(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
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
        self.client.force_login(admin)

        response = self.client.get('/api/users/?search=иванов&role=student&page=1&page_size=10')

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['count'], 1)
        self.assertEqual(
            payload['results'][0],
            {
                'id': student_user.id,
                'username': 'ivanov',
                'email': 'ivanov@student.msu.ru',
                'role': 'student',
                'universityId': self.university.id,
                'universityName': self.university.name,
                'studentId': student.id,
                'studentName': 'Иванов Иван Иванович',
                'isActive': True,
                'createdAt': student_user.date_joined.date().isoformat(),
            },
        )

    def test_admin_can_filter_users_by_university_role(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.force_login(admin)

        response = self.client.get('/api/users/?role=university&page_size=1')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 2)
        self.assertEqual(response.json()['results'][0]['role'], 'university')
        self.assertEqual(response.json()['results'][0]['studentId'], None)

    def test_university_can_list_only_own_users(self):
        own_student_user = User.objects.create_user(
            username='ivanov',
            email='ivanov@student.msu.ru',
            password='StrongPass123',
        )
        own_student = Student.objects.create(
            university=self.university,
            user=own_student_user,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        other_student_user = User.objects.create_user(
            username='petrov',
            email='petrov@student.spbu.ru',
            password='StrongPass123',
        )
        Student.objects.create(
            university=self.other_university,
            user=other_student_user,
            full_name='Петров Петр Петрович',
            email='petrov@student.spbu.ru',
            group='ПМ-301',
            course=3,
        )

        response = self.client.get('/api/users/?page=1&page_size=10')

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['count'], 2)
        self.assertEqual(
            {user['id'] for user in payload['results']},
            {self.user.id, own_student_user.id},
        )
        own_student_payload = next(user for user in payload['results'] if user['id'] == own_student_user.id)
        self.assertEqual(own_student_payload['role'], 'student')
        self.assertEqual(own_student_payload['studentId'], own_student.id)
        self.assertEqual(own_student_payload['universityId'], self.university.id)

    def test_university_users_list_keeps_role_filter_inside_own_university(self):
        own_student_user = User.objects.create_user(
            username='ivanov',
            email='ivanov@student.msu.ru',
            password='StrongPass123',
        )
        Student.objects.create(
            university=self.university,
            user=own_student_user,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        other_student_user = User.objects.create_user(
            username='petrov',
            email='petrov@student.spbu.ru',
            password='StrongPass123',
        )
        Student.objects.create(
            university=self.other_university,
            user=other_student_user,
            full_name='Петров Петр Петрович',
            email='petrov@student.spbu.ru',
            group='ПМ-301',
            course=3,
        )

        response = self.client.get('/api/users/?role=student')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['id'], own_student_user.id)

    def test_university_cannot_delete_user(self):
        response = self.client.delete(f'/api/users/{self.other_user.id}/')

        self.assertEqual(response.status_code, 403)
        self.assertTrue(User.objects.filter(id=self.other_user.id).exists())

    def test_admin_users_list_rejects_invalid_role(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.force_login(admin)

        response = self.client.get('/api/users/?role=manager')

        self.assertEqual(response.status_code, 400)

    def test_admin_can_delete_user(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
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
        self.client.force_login(admin)

        response = self.client.delete(f'/api/users/{student_user.id}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(id=student_user.id).exists())
        self.assertFalse(Student.objects.filter(id=student.id).exists())

    def test_admin_deleting_university_user_deletes_student_accounts(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        student_user = User.objects.create_user(
            username='ivanov',
            email='ivanov@student.msu.ru',
            password='StrongPass123',
        )
        Student.objects.create(
            university=self.university,
            user=student_user,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        self.client.force_login(admin)

        response = self.client.delete(f'/api/users/{self.user.id}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(User.objects.filter(id=self.user.id).exists())
        self.assertFalse(University.objects.filter(id=self.university.id).exists())
        self.assertFalse(User.objects.filter(id=student_user.id).exists())

    def test_admin_delete_user_returns_404_for_missing_user(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.force_login(admin)

        response = self.client.delete('/api/users/999999/')

        self.assertEqual(response.status_code, 404)

    def test_admin_can_create_university_account_and_email_generated_password(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.force_login(admin)

        response = self.client.post(
            '/api/universities/',
            data=json.dumps(
                {
                    'name': 'КФУ',
                    'email': 'office@kfu.ru',
                    'username': 'kfu',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        payload = response.json()
        self.assertEqual(payload['name'], 'КФУ')
        self.assertEqual(payload['username'], 'kfu')
        self.assertEqual(payload['email'], 'office@kfu.ru')
        self.assertNotIn('password', payload)
        self.assertNotIn('temporaryPassword', payload)

        university = University.objects.get(name='КФУ')
        self.assertEqual(university.user.username, 'kfu')
        self.assertEqual(university.user.email, 'office@kfu.ru')
        self.assertEqual(payload['userId'], university.user_id)
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['office@kfu.ru'])
        self.assertIn('Логин: kfu', mail.outbox[0].body)
        self.assertIn('Пароль:', mail.outbox[0].body)

    def test_university_user_cannot_create_university_account(self):
        response = self.client.post(
            '/api/universities/',
            data=json.dumps(
                {
                    'name': 'КФУ',
                    'email': 'office@kfu.ru',
                    'username': 'kfu',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertFalse(University.objects.filter(name='КФУ').exists())

    def test_admin_can_list_universities(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.force_login(admin)

        response = self.client.get('/api/universities/?search=мгу')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['name'], self.university.name)

    def test_admin_can_update_university_account(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.force_login(admin)

        response = self.client.put(
            f'/api/universities/{self.university.id}/',
            data=json.dumps(
                {
                    'name': 'МГУ',
                    'email': 'office@msu.ru',
                    'username': 'msu-office',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.university.refresh_from_db()
        self.user.refresh_from_db()
        self.assertEqual(self.university.name, 'МГУ')
        self.assertEqual(self.user.email, 'office@msu.ru')
        self.assertEqual(self.user.username, 'msu-office')
        self.assertEqual(response.json()['name'], 'МГУ')

    def test_admin_can_delete_university_account(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        student_user = User.objects.create_user(
            username='ivanov',
            email='ivanov@student.msu.ru',
            password='StrongPass123',
        )
        Student.objects.create(
            university=self.university,
            user=student_user,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        self.client.force_login(admin)
        university_id = self.university.id
        user_id = self.user.id
        student_user_id = student_user.id

        response = self.client.delete(f'/api/universities/{university_id}/')

        self.assertEqual(response.status_code, 204)
        self.assertFalse(University.objects.filter(id=university_id).exists())
        self.assertFalse(User.objects.filter(id=user_id).exists())
        self.assertFalse(User.objects.filter(id=student_user_id).exists())

    def test_university_user_cannot_update_or_delete_university_account(self):
        update_response = self.client.put(
            f'/api/universities/{self.university.id}/',
            data=json.dumps(
                {
                    'name': 'МГУ',
                    'email': 'office@msu.ru',
                    'username': 'msu-office',
                }
            ),
            content_type='application/json',
        )
        delete_response = self.client.delete(f'/api/universities/{self.university.id}/')

        self.assertEqual(update_response.status_code, 403)
        self.assertEqual(delete_response.status_code, 403)
        self.assertTrue(University.objects.filter(id=self.university.id).exists())

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

    def test_university_can_update_student_inside_current_university(self):
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

        response = self.client.put(
            f'/api/students/{student.id}/',
            data=json.dumps(
                {
                    'fullName': 'Иванов Иван Петрович',
                    'email': 'ivanov.updated@student.msu.ru',
                    'group': 'ИВТ-501',
                    'course': 5,
                    'status': Student.STATUS_INACTIVE,
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        student.refresh_from_db()
        student_user.refresh_from_db()
        self.assertEqual(student.full_name, 'Иванов Иван Петрович')
        self.assertEqual(student.email, 'ivanov.updated@student.msu.ru')
        self.assertEqual(student.group, 'ИВТ-501')
        self.assertEqual(student.course, 5)
        self.assertEqual(student.status, Student.STATUS_INACTIVE)
        self.assertEqual(student_user.email, 'ivanov.updated@student.msu.ru')
        self.assertEqual(response.json()['fullName'], 'Иванов Иван Петрович')

    def test_update_student_only_inside_current_university(self):
        other_student = Student.objects.create(
            university=self.other_university,
            full_name='Петров Петр Петрович',
            email='petrov@student.spbu.ru',
            group='ПМ-101',
            course=1,
        )

        response = self.client.put(
            f'/api/students/{other_student.id}/',
            data=json.dumps(
                {
                    'fullName': 'Петров Петр Иванович',
                    'email': 'petrov.updated@student.spbu.ru',
                    'group': 'ПМ-201',
                    'course': 2,
                    'status': Student.STATUS_INACTIVE,
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 404)
        other_student.refresh_from_db()
        self.assertEqual(other_student.full_name, 'Петров Петр Петрович')

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

    def test_admin_can_view_all_diplomas(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
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
        self.client.force_login(admin)

        response = self.client.get('/api/diplomas/?search=спбгу')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['number'], 'DIP-2026-002')
        self.assertEqual(response.json()['results'][0]['universityName'], self.other_university.name)

    def test_verify_diploma_by_number_and_issued_at(self):
        student = Student.objects.create(
            university=self.university,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        Diploma.objects.create(
            university=self.university,
            student=student,
            number='DIP-2026-001',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )

        response = self.client.post(
            '/api/diplomas/verify/',
            data=json.dumps(
                {
                    'number': 'DIP-2026-001',
                    'issuedAt': '2026-05-10',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertTrue(payload['verified'])
        self.assertEqual(payload['verificationStatus'], 'verified')
        self.assertEqual(payload['verificationMessage'], 'Диплом верифицирован.')
        self.assertEqual(payload['diploma']['owner'], 'Иванов Иван Иванович')
        self.assertEqual(payload['diploma']['universityName'], self.university.name)
        self.assertEqual(payload['verificationUrl'], f"/diplom/{payload['diploma']['publicId']}")
        self.assertEqual(payload['verificationApiUrl'], f"/api/diplom/{payload['diploma']['publicId']}/")
        log = DiplomaVerificationLog.objects.get()
        self.assertEqual(log.diploma.number, 'DIP-2026-001')
        self.assertEqual(log.university, self.university)
        self.assertEqual(log.verification_status, DiplomaVerificationLog.STATUS_VERIFIED)
        self.assertTrue(log.verified)

    def test_verify_diploma_accepts_series_and_number(self):
        student = Student.objects.create(
            university=self.university,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        Diploma.objects.create(
            university=self.university,
            student=student,
            number='AB-123456',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )

        response = self.client.post(
            '/api/diplomas/verify/',
            data=json.dumps(
                {
                    'series': 'AB',
                    'number': '123456',
                    'issuedAt': '2026-05-10',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['verified'])
        self.assertEqual(response.json()['diploma']['number'], 'AB-123456')

    def test_public_diploma_view_by_uuid(self):
        student = Student.objects.create(
            university=self.university,
            full_name='Иванов Иван Иванович',
            email='ivanov@student.msu.ru',
            group='ИВТ-401',
            course=4,
        )
        diploma = Diploma.objects.create(
            university=self.university,
            student=student,
            number='DIP-2026-001',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        self.client.logout()

        response = self.client.get(f'/api/diplom/{diploma.public_id}/')

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['verified'])
        self.assertEqual(response.json()['verificationUrl'], f'/diplom/{diploma.public_id}')
        self.assertEqual(response.json()['diploma']['number'], 'DIP-2026-001')
        log = DiplomaVerificationLog.objects.get()
        self.assertEqual(log.source, DiplomaVerificationLog.SOURCE_PUBLIC)
        self.assertEqual(log.requested_public_id, diploma.public_id)
        self.assertEqual(log.university, self.university)

    def test_verify_diploma_returns_not_found(self):
        response = self.client.post(
            '/api/diplomas/verify/',
            data=json.dumps(
                {
                    'number': 'DIP-404',
                    'issuedAt': '2026-05-10',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 404)
        self.assertFalse(response.json()['verified'])
        self.assertEqual(response.json()['verificationStatus'], 'not_found')
        self.assertIsNone(response.json()['diploma'])
        log = DiplomaVerificationLog.objects.get()
        self.assertIsNone(log.diploma)
        self.assertIsNone(log.university)
        self.assertEqual(log.requested_number, 'DIP-404')
        self.assertEqual(log.verification_status, DiplomaVerificationLog.STATUS_NOT_FOUND)

    def test_admin_can_view_all_verification_logs(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
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
        own_diploma = Diploma.objects.create(
            university=self.university,
            student=own_student,
            number='DIP-2026-001',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        other_diploma = Diploma.objects.create(
            university=self.other_university,
            student=other_student,
            number='DIP-2026-002',
            speciality='Математика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        DiplomaVerificationLog.objects.create(
            diploma=own_diploma,
            university=self.university,
            source=DiplomaVerificationLog.SOURCE_FORM,
            requested_number='DIP-2026-001',
            requested_issued_at='2026-05-10',
            verification_status=DiplomaVerificationLog.STATUS_VERIFIED,
            verified=True,
        )
        DiplomaVerificationLog.objects.create(
            diploma=other_diploma,
            university=self.other_university,
            source=DiplomaVerificationLog.SOURCE_FORM,
            requested_number='DIP-2026-002',
            requested_issued_at='2026-05-10',
            verification_status=DiplomaVerificationLog.STATUS_VERIFIED,
            verified=True,
        )
        self.client.force_login(admin)

        response = self.client.get('/api/diplomas/verification-logs/?page_size=1000')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 2)
        self.assertEqual(len(response.json()['results']), 2)

    def test_university_can_view_only_own_verification_logs(self):
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
        own_diploma = Diploma.objects.create(
            university=self.university,
            student=own_student,
            number='DIP-2026-001',
            speciality='Информатика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        other_diploma = Diploma.objects.create(
            university=self.other_university,
            student=other_student,
            number='DIP-2026-002',
            speciality='Математика',
            qualification='Бакалавр',
            issued_at='2026-05-10',
        )
        DiplomaVerificationLog.objects.create(
            diploma=own_diploma,
            university=self.university,
            source=DiplomaVerificationLog.SOURCE_FORM,
            requested_number='DIP-2026-001',
            requested_issued_at='2026-05-10',
            verification_status=DiplomaVerificationLog.STATUS_VERIFIED,
            verified=True,
        )
        DiplomaVerificationLog.objects.create(
            diploma=other_diploma,
            university=self.other_university,
            source=DiplomaVerificationLog.SOURCE_FORM,
            requested_number='DIP-2026-002',
            requested_issued_at='2026-05-10',
            verification_status=DiplomaVerificationLog.STATUS_VERIFIED,
            verified=True,
        )
        DiplomaVerificationLog.objects.create(
            source=DiplomaVerificationLog.SOURCE_FORM,
            requested_number='DIP-404',
            requested_issued_at='2026-05-10',
            verification_status=DiplomaVerificationLog.STATUS_NOT_FOUND,
            verified=False,
        )

        response = self.client.get('/api/diplomas/verification-logs/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 1)
        self.assertEqual(response.json()['results'][0]['diploma']['number'], 'DIP-2026-001')

    def test_student_cannot_view_verification_logs(self):
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

        response = self.client.get('/api/diplomas/verification-logs/')

        self.assertEqual(response.status_code, 403)

    def test_paginated_lists_cap_page_size_at_100(self):
        admin = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        universities = [
            University(
                user=User.objects.create_user(
                    username=f'university-{index}',
                    email=f'university-{index}@example.com',
                    password='StrongPass123',
                ),
                name=f'University {index:03d}',
            )
            for index in range(101)
        ]
        University.objects.bulk_create(universities)
        self.client.force_login(admin)

        response = self.client.get('/api/universities/?page_size=1000')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 103)
        self.assertEqual(len(response.json()['results']), 100)

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
        self.assertEqual(
            response.json()['results'][0]['verificationUrl'],
            f"/diplom/{response.json()['results'][0]['publicId']}",
        )

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

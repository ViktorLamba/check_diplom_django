import json
from urllib.parse import parse_qs, urlparse

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.core import mail
from django.test import Client, TestCase, override_settings
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

from .models import TwoFactorCode
from apps.registry.models import Student, University

User = get_user_model()


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.login_verify_url = '/api/auth/login/verify/'
        self.change_password_url = '/api/auth/change-password/'
        self.password_reset_url = '/api/auth/password-reset/'
        self.password_reset_confirm_url = '/api/auth/password-reset/confirm/'
        self.logout_url = '/api/auth/logout/'
        self.me_url = '/api/auth/me/'

    def test_register_available_only_for_admin(self):
        payload = {
            'username': 'alice',
            'email': 'alice@example.com',
            'password': 'StrongPass123',
            'password_confirm': 'StrongPass123',
        }
        response_without_auth = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json',
        )
        self.assertEqual(response_without_auth.status_code, 403)

        admin = User.objects.create_user(
            username='root_admin',
            email='root@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.force_login(admin)
        response_with_admin = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json',
        )

        self.assertEqual(response_with_admin.status_code, 201)
        self.assertTrue(User.objects.filter(username='alice').exists())

    def test_register_password_mismatch(self):
        admin = User.objects.create_user(
            username='root_admin',
            email='root@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.force_login(admin)

        payload = {
            'username': 'bob',
            'email': 'bob@example.com',
            'password': 'StrongPass123',
            'password_confirm': 'StrongPass456',
        }
        response = self.client.post(
            self.register_url,
            data=json.dumps(payload),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertFalse(User.objects.filter(username='bob').exists())

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend', FRONTEND_URL='http://localhost:3000')
    def test_password_reset_request_sends_email_with_reset_link(self):
        User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )

        response = self.client.post(
            self.password_reset_url,
            data=json.dumps({'email': 'student@example.com'}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()['detail'],
            'Если пользователь с таким email существует, письмо для восстановления пароля отправлено.',
        )
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('http://localhost:3000/reset-password?', mail.outbox[0].body)

        reset_url = next(line for line in mail.outbox[0].body.splitlines() if line.startswith('http://localhost:3000'))
        parsed_url = urlparse(reset_url)
        query = parse_qs(parsed_url.query)

        self.assertEqual(parsed_url.path, '/reset-password')
        self.assertIn('uid', query)
        self.assertIn('token', query)

    @override_settings(EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend')
    def test_password_reset_request_returns_same_response_for_unknown_email(self):
        response = self.client.post(
            self.password_reset_url,
            data=json.dumps({'email': 'missing@example.com'}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json()['detail'],
            'Если пользователь с таким email существует, письмо для восстановления пароля отправлено.',
        )
        self.assertEqual(len(mail.outbox), 0)

    def test_password_reset_confirm_changes_password(self):
        user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(
            self.password_reset_confirm_url,
            data=json.dumps(
                {
                    'uid': uid,
                    'token': token,
                    'password': 'NewStrongPass123',
                    'passwordConfirm': 'NewStrongPass123',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['detail'], 'Пароль успешно изменён.')
        user.refresh_from_db()
        self.assertTrue(user.check_password('NewStrongPass123'))

    def test_password_reset_confirm_rejects_password_mismatch(self):
        response = self.client.post(
            self.password_reset_confirm_url,
            data=json.dumps(
                {
                    'uid': 'bad-uid',
                    'token': 'bad-token',
                    'password': 'NewStrongPass123',
                    'passwordConfirm': 'NewStrongPass456',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['detail'], 'Пароли не совпадают.')

    def test_password_reset_confirm_rejects_weak_password(self):
        user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)

        response = self.client.post(
            self.password_reset_confirm_url,
            data=json.dumps(
                {
                    'uid': uid,
                    'token': token,
                    'password': '123',
                    'passwordConfirm': '123',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        user.refresh_from_db()
        self.assertTrue(user.check_password('StrongPass123'))

    def test_password_reset_confirm_rejects_invalid_token(self):
        user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )
        uid = urlsafe_base64_encode(force_bytes(user.pk))

        response = self.client.post(
            self.password_reset_confirm_url,
            data=json.dumps(
                {
                    'uid': uid,
                    'token': 'invalid-token',
                    'password': 'NewStrongPass123',
                    'passwordConfirm': 'NewStrongPass123',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        user.refresh_from_db()
        self.assertTrue(user.check_password('StrongPass123'))

    def test_password_reset_confirm_rejects_invalid_uid(self):
        response = self.client.post(
            self.password_reset_confirm_url,
            data=json.dumps(
                {
                    'uid': 'bad-uid',
                    'token': 'invalid-token',
                    'password': 'NewStrongPass123',
                    'passwordConfirm': 'NewStrongPass123',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)

    def test_change_password_requires_auth(self):
        response = self.client.post(
            self.change_password_url,
            data=json.dumps(
                {
                    'oldPassword': 'StrongPass123',
                    'newPassword': 'NewStrongPass123',
                    'newPasswordConfirm': 'NewStrongPass123',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 401)

    def test_change_password_changes_password_and_keeps_session(self):
        user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )
        self.client.force_login(user)

        response = self.client.post(
            self.change_password_url,
            data=json.dumps(
                {
                    'oldPassword': 'StrongPass123',
                    'newPassword': 'NewStrongPass123',
                    'newPasswordConfirm': 'NewStrongPass123',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['detail'], 'Пароль успешно изменён.')
        user.refresh_from_db()
        self.assertTrue(user.check_password('NewStrongPass123'))

        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()['user']['username'], 'student')

    def test_change_password_rejects_wrong_old_password(self):
        user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )
        self.client.force_login(user)

        response = self.client.post(
            self.change_password_url,
            data=json.dumps(
                {
                    'oldPassword': 'WrongPass123',
                    'newPassword': 'NewStrongPass123',
                    'newPasswordConfirm': 'NewStrongPass123',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['detail'], 'Старый пароль указан неверно.')
        user.refresh_from_db()
        self.assertTrue(user.check_password('StrongPass123'))

    def test_change_password_rejects_password_mismatch(self):
        user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )
        self.client.force_login(user)

        response = self.client.post(
            self.change_password_url,
            data=json.dumps(
                {
                    'oldPassword': 'StrongPass123',
                    'newPassword': 'NewStrongPass123',
                    'newPasswordConfirm': 'NewStrongPass456',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['detail'], 'Пароли не совпадают.')
        user.refresh_from_db()
        self.assertTrue(user.check_password('StrongPass123'))

    def test_change_password_rejects_weak_password(self):
        user = User.objects.create_user(
            username='student',
            email='student@example.com',
            password='StrongPass123',
        )
        self.client.force_login(user)

        response = self.client.post(
            self.change_password_url,
            data=json.dumps(
                {
                    'oldPassword': 'StrongPass123',
                    'newPassword': '123',
                    'newPasswordConfirm': '123',
                }
            ),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 400)
        user.refresh_from_db()
        self.assertTrue(user.check_password('StrongPass123'))

    def test_university_login_requires_2fa(self):
        User.objects.create_user(
            username='charlie',
            email='charlie@example.com',
            password='StrongPass123',
        )

        response = self.client.post(
            self.login_url,
            data=json.dumps({'username': 'charlie', 'password': 'StrongPass123'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.json()['requires_2fa'])
        self.assertNotIn('code_debug', response.json())

        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, 401)

        code = TwoFactorCode.objects.filter(user__username='charlie').latest('created_at').code
        verify_response = self.client.post(
            self.login_verify_url,
            data=json.dumps({'username': 'charlie', 'code': code}),
            content_type='application/json',
        )
        self.assertEqual(verify_response.status_code, 200)

        me_response_after_2fa = self.client.get(self.me_url)
        self.assertEqual(me_response_after_2fa.status_code, 200)
        self.assertEqual(me_response_after_2fa.json()['user']['username'], 'charlie')

    def test_admin_login_without_2fa(self):
        User.objects.create_user(
            username='admin_user',
            email='admin@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        response = self.client.post(
            self.login_url,
            data=json.dumps({'username': 'admin_user', 'password': 'StrongPass123'}),
            content_type='application/json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn('requires_2fa', response.json())

        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, 200)
        self.assertEqual(me_response.json()['user']['role'], 'admin')
        self.assertIsNone(me_response.json()['user']['universityId'])

    def test_me_returns_university_role_payload(self):
        user = User.objects.create_user(
            username='university_user',
            email='university@example.com',
            password='StrongPass123',
        )
        university = University.objects.create(user=user, name='МГУ им. М. В. Ломоносова')
        self.client.force_login(user)

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, 200)
        payload = response.json()['user']
        self.assertEqual(payload['role'], 'university')
        self.assertEqual(payload['universityId'], university.id)
        self.assertEqual(payload['universityName'], university.name)

    def test_me_returns_student_role_payload(self):
        university_user = User.objects.create_user(
            username='university_user',
            email='university@example.com',
            password='StrongPass123',
        )
        university = University.objects.create(user=university_user, name='МГУ им. М. В. Ломоносова')
        student_user = User.objects.create_user(
            username='student_user',
            email='student@example.com',
            password='StrongPass123',
        )
        student = Student.objects.create(
            university=university,
            user=student_user,
            full_name='Иванов Иван Иванович',
            email='student@example.com',
            group='ИВТ-401',
            course=4,
        )
        self.client.force_login(student_user)

        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, 200)
        payload = response.json()['user']
        self.assertEqual(payload['role'], 'student')
        self.assertEqual(payload['studentId'], student.id)
        self.assertEqual(payload['studentName'], student.full_name)

    def test_two_factor_code_cannot_be_reused(self):
        User.objects.create_user(
            username='dora',
            email='dora@example.com',
            password='StrongPass123',
        )
        login_response = self.client.post(
            self.login_url,
            data=json.dumps({'username': 'dora', 'password': 'StrongPass123'}),
            content_type='application/json',
        )
        self.assertEqual(login_response.status_code, 200)
        code = TwoFactorCode.objects.filter(user__username='dora').latest('created_at').code

        first_verify = self.client.post(
            self.login_verify_url,
            data=json.dumps({'username': 'dora', 'code': code}),
            content_type='application/json',
        )
        self.assertEqual(first_verify.status_code, 200)

        self.client.post(
            self.logout_url,
            data=json.dumps({}),
            content_type='application/json',
        )

        second_verify = self.client.post(
            self.login_verify_url,
            data=json.dumps({'username': 'dora', 'code': code}),
            content_type='application/json',
        )
        self.assertEqual(second_verify.status_code, 401)
        self.assertEqual(TwoFactorCode.objects.filter(user__username='dora', is_used=True).count(), 1)

    def test_logout(self):
        User.objects.create_user(
            username='eva',
            email='eva@example.com',
            password='StrongPass123',
            is_staff=True,
        )
        self.client.post(
            self.login_url,
            data=json.dumps({'username': 'eva', 'password': 'StrongPass123'}),
            content_type='application/json',
        )

        logout_response = self.client.post(
            self.logout_url,
            data=json.dumps({}),
            content_type='application/json',
        )
        self.assertEqual(logout_response.status_code, 200)

        me_response = self.client.get(self.me_url)
        self.assertEqual(me_response.status_code, 401)

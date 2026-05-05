import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from .models import TwoFactorCode

User = get_user_model()


class AuthApiTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.login_verify_url = '/api/auth/login/verify/'
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

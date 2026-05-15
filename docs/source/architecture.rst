Архитектура
===========

Структура репозитория
---------------------

.. code-block:: text

   .
   ├── backend/
   │   ├── apps/auth/
   │   ├── apps/registry/
   │   ├── config/
   │   └── manage.py
   ├── frontend/
   │   ├── src/app/
   │   ├── src/pages/
   │   ├── src/shared/
   │   └── src/widgets/
   ├── docker-compose.yml
   ├── docker-compose.prod.yml
   ├── docker-compose.test.yml
   ├── requirements.txt
   └── .github/workflows/

Backend
-------

``backend/config`` содержит настройки Django, корневой роутер, WSGI и ASGI.

``backend/apps/auth`` отвечает за:

* вход и выход;
* получение текущего пользователя;
* регистрацию пользователя администратором;
* двухфакторную авторизацию;
* восстановление и смену пароля.

``backend/apps/registry`` отвечает за:

* вузы;
* студентов;
* дипломы;
* публичную проверку;
* журнал проверок.

Модель данных
-------------

``University``
   Вуз. Связан с пользователем Django отношением one-to-one.

``Student``
   Студент вуза. Может быть связан с пользователем Django для входа в личный
   кабинет.

``Diploma``
   Диплом студента. Имеет номер, специальность, квалификацию, дату выдачи,
   публичный UUID и статус.

``DiplomaVerificationLog``
   Запись проверки диплома. Хранит источник проверки, запрошенные данные,
   результат, IP и user-agent.

``TwoFactorCode``
   Одноразовый код входа. Используется для 2FA вузов и студентов.

Сессии
------

Проект использует Django sessions. Сессия настроена как браузерная:
``SESSION_EXPIRE_AT_BROWSER_CLOSE = True``. Это означает, что cookie сессии
не должна переживать закрытие браузера.

Frontend
--------

Frontend построен на React и Vite. Запросы к API идут через общий helper
``request`` из ``frontend/src/shared/api/http.ts`` с ``credentials: "include"``,
чтобы браузер отправлял cookie-сессию Django.

В production frontend обслуживается Nginx. Все запросы ``/api/`` проксируются
на backend-сервис ``web:8000``.

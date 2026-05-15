Локальный запуск
================

Docker
------

Запуск backend и PostgreSQL:

.. code-block:: bash

   docker compose up -d

Опционально можно поднять frontend-контейнер:

.. code-block:: bash

   docker compose --profile frontend up -d

Для полноценной frontend-разработки удобнее запускать Vite на хосте через
``npm run dev``. Текущий Vite proxy направляет ``/api`` на
``http://127.0.0.1:8000``.

Полезные команды:

.. code-block:: bash

   docker compose exec web python manage.py migrate
   docker compose exec web python manage.py createsuperuser
   docker compose down

Запуск без Docker
-----------------

Backend:

.. code-block:: bash

   python -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   export DB_NAME=django_db
   export DB_USER=django_user
   export DB_PASSWORD=django_pass
   export DB_HOST=127.0.0.1
   export DB_PORT=5333
   python backend/manage.py migrate
   python backend/manage.py runserver

Frontend:

.. code-block:: bash

   cd frontend
   npm install
   npm run dev

Переменные окружения
--------------------

Подключение к базе:

* ``DB_NAME``
* ``DB_USER``
* ``DB_PASSWORD``
* ``DB_HOST``
* ``DB_PORT``

Основные настройки Django:

* ``DJANGO_SECRET_KEY``
* ``DJANGO_DEBUG``
* ``DJANGO_ALLOWED_HOSTS``
* ``FRONTEND_URL``

Email:

* ``DJANGO_EMAIL_BACKEND``
* ``DJANGO_EMAIL_HOST``
* ``DJANGO_EMAIL_PORT``
* ``DJANGO_EMAIL_HOST_USER``
* ``DJANGO_EMAIL_HOST_PASSWORD``
* ``DJANGO_EMAIL_USE_TLS``
* ``DJANGO_EMAIL_USE_SSL``
* ``DJANGO_DEFAULT_FROM_EMAIL``

Сборка Sphinx-документации
--------------------------

.. code-block:: bash

   python -m venv .venv-docs
   source .venv-docs/bin/activate
   pip install -r docs/requirements.txt
   cd docs
   make html

Готовая HTML-документация появится в ``docs/build/html/``.

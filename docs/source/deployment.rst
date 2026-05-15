CI/CD и деплой
==============

CI
--

Workflow: ``.github/workflows/ci.yml``.

Запускается на:

* ``push`` во все ветки;
* ``pull_request``.

Job ``lint-and-test``:

* поднимает PostgreSQL 16;
* устанавливает Python 3.12;
* устанавливает зависимости;
* запускает ``flake8 backend``;
* проверяет миграции через ``makemigrations --check --dry-run``;
* запускает тесты ``apps.auth`` и ``apps.registry``.

Job ``build-and-push-images`` выполняется только для push в ``main`` или
``release``:

* ``main`` публикует ``backend-prod`` и ``frontend-prod``;
* ``release`` публикует ``backend-test`` и ``frontend-test``.
* документация публикуется как ``docs-prod`` или ``docs-test``.

CD
--

Workflow: ``.github/workflows/cd.yml``.

Запускается после успешного CI для веток ``main`` и ``release``.

Окружения:

.. list-table::
   :header-rows: 1
   :widths: 20 25 20 20 20

   * - Ветка
     - Проект Compose
     - Frontend
     - Backend/admin
     - Документация
   * - ``main``
     - ``check_prod``
     - ``8010``
     - ``8020``
     - ``8030``
   * - ``release``
     - ``check_test``
     - ``4999``
     - ``4998``
     - ``4997``

Для ``release`` PostgreSQL дополнительно публикуется на порт ``5433``.

Деплой выполняется по SSH:

* сервер обновляет рабочую копию репозитория;
* формирует ``.env``;
* логинится в Docker Hub;
* подтягивает Docker-образы;
* пересоздает контейнеры;
* выполняет миграции.

Документация
------------

Sphinx-документация собирается в отдельном Docker-образе ``docs``. На этапе
сборки образа выполняется ``make html``, а готовая директория
``docs/build/html`` копируется в Nginx и отдается как статический сайт.

Production-адрес после деплоя:

.. code-block:: text

   http://SERVER_IP:8030

Test-адрес после деплоя ветки ``release``:

.. code-block:: text

   http://SERVER_IP:4997

GitHub Secrets
--------------

* ``DOCKERHUB_USERNAME``
* ``DOCKERHUB_TOKEN``
* ``DOCKERHUB_REPO``
* ``SSH_HOST``
* ``SSH_USER``
* ``SSH_KEY``
* ``DEPLOY_PATH``
* ``DJANGO_ALLOWED_HOSTS_MAIN``
* ``DJANGO_ALLOWED_HOSTS_RELEASE``
* ``DOCS_EXTERNAL_PORT_MAIN``
* ``DOCS_EXTERNAL_PORT_RELEASE``
* ``POSTGRES_DB``
* ``POSTGRES_USER``
* ``POSTGRES_PASSWORD``
* ``DJANGO_SECRET_KEY``
* ``DJANGO_EMAIL_BACKEND``
* ``DJANGO_EMAIL_HOST``
* ``DJANGO_EMAIL_PORT``
* ``DJANGO_EMAIL_HOST_USER``
* ``DJANGO_EMAIL_HOST_PASSWORD``
* ``DJANGO_EMAIL_USE_TLS``
* ``DJANGO_EMAIL_USE_SSL``
* ``DJANGO_DEFAULT_FROM_EMAIL``

``DJANGO_ALLOWED_HOSTS`` должен содержать домены или IP без портов.

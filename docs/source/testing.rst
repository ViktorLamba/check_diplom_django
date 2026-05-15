Тесты и проверки
================

Backend
-------

.. code-block:: bash

   flake8 backend
   python backend/manage.py makemigrations --check --dry-run
   python backend/manage.py test apps.auth apps.registry

Для запуска backend-команд должны быть заданы переменные подключения к
PostgreSQL: ``DB_NAME``, ``DB_USER``, ``DB_PASSWORD``, ``DB_HOST`` и
``DB_PORT``.

Frontend
--------

.. code-block:: bash

   cd frontend
   npm run lint
   npm run build

Документация
------------

.. code-block:: bash

   cd docs
   make html

HTML-файлы будут собраны в ``docs/build/html/``.

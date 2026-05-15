Сервис проверки дипломов
=========================

Документация проекта для учета и проверки подлинности дипломов.

Система помогает администраторам управлять вузами, вузам вести студентов и
выпускать дипломы, студентам просматривать свои документы, а внешним
пользователям проверять диплом по номеру и дате выдачи или по публичной ссылке.

.. toctree::
   :maxdepth: 2
   :caption: Содержание

   overview
   installation
   architecture
   roles
   api
   frontend
   code_reference
   deployment
   testing
   contacts

Быстрый старт
-------------

Запуск backend и PostgreSQL:

.. code-block:: bash

   docker compose up -d

Адреса локального окружения:

* Backend: ``http://localhost:8000``
* Django admin: ``http://localhost:8000/admin/``
* Frontend: ``http://localhost:3000``
* PostgreSQL на хосте: ``localhost:5333``

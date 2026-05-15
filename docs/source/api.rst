API
===

Общие правила
-------------

API возвращает JSON. Для авторизованных запросов используется cookie-сессия
Django. Списковые эндпоинты поддерживают пагинацию через ``page`` и
``page_size``.

Авторизация
-----------

Базовый префикс: ``/api/auth/``.

.. list-table::
   :header-rows: 1
   :widths: 20 35 45

   * - Метод
     - URL
     - Назначение
   * - POST
     - ``/api/auth/login/``
     - Вход по ``username`` и ``password``.
   * - POST
     - ``/api/auth/login/verify/``
     - Подтверждение 2FA-кода.
   * - POST
     - ``/api/auth/register/``
     - Создание пользователя администратором.
   * - POST
     - ``/api/auth/change-password/``
     - Смена пароля текущего пользователя.
   * - POST
     - ``/api/auth/password-reset/``
     - Запрос ссылки восстановления пароля.
   * - POST
     - ``/api/auth/password-reset/confirm/``
     - Установка нового пароля по ``uid`` и ``token``.
   * - POST
     - ``/api/auth/logout/``
     - Выход.
   * - GET
     - ``/api/auth/me/``
     - Текущий пользователь.

Реестр
------

Базовый префикс: ``/api/``.

.. list-table::
   :header-rows: 1
   :widths: 20 35 45

   * - Метод
     - URL
     - Назначение
   * - GET
     - ``/api/public/stats/``
     - Публичная статистика.
   * - GET
     - ``/api/users/``
     - Список пользователей для администратора или вуза.
   * - DELETE
     - ``/api/users/<user_id>/``
     - Удаление пользователя администратором.
   * - GET
     - ``/api/universities/``
     - Список вузов.
   * - POST
     - ``/api/universities/``
     - Создание вуза администратором.
   * - PUT/PATCH/DELETE
     - ``/api/universities/<university_id>/``
     - Изменение или удаление вуза.
   * - GET
     - ``/api/students/``
     - Студенты текущего вуза.
   * - POST
     - ``/api/students/``
     - Создание студента текущим вузом.
   * - PUT/PATCH/DELETE
     - ``/api/students/<student_id>/``
     - Изменение или удаление студента.
   * - GET
     - ``/api/diplomas/``
     - Список дипломов для администратора или вуза.
   * - POST
     - ``/api/diplomas/``
     - Создание диплома текущим вузом.
   * - POST
     - ``/api/diplomas/verify/``
     - Публичная проверка по номеру и дате выдачи.
   * - GET
     - ``/api/diplomas/verification-logs/``
     - Журнал проверок.
   * - GET
     - ``/api/diplomas/my/``
     - Дипломы текущего студента.
   * - GET
     - ``/api/diplom/<public_id>/``
     - Публичная проверка диплома по UUID.

Проверка диплома
----------------

Запрос:

.. code-block:: http

   POST /api/diplomas/verify/
   Content-Type: application/json

   {
     "series": "ABC",
     "number": "123456",
     "issuedAt": "2026-05-15"
   }

``series`` необязательна. Backend ищет диплом по номеру, а если серия указана,
также проверяет варианты ``series + number``, ``series number`` и
``series-number``.

Возможные статусы проверки:

* ``verified`` - диплом найден и действителен;
* ``revoked`` - диплом найден, но отозван;
* ``not_found`` - диплом не найден.

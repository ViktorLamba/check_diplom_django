Frontend
========

Маршруты
--------

.. list-table::
   :header-rows: 1
   :widths: 35 65

   * - URL
     - Назначение
   * - ``/home``
     - Публичная главная страница.
   * - ``/login``
     - Вход.
   * - ``/verification``
     - Публичная проверка диплома.
   * - ``/diplom/:publicId``
     - Публичная страница диплома.
   * - ``/home/dashboard``
     - Дашборд для администратора и вуза.
   * - ``/home/history``
     - Журнал проверок.
   * - ``/home/diplomas``
     - Список дипломов.
   * - ``/home/diplomas/create``
     - Создание диплома вузом.
   * - ``/home/students``
     - Студенты вуза.
   * - ``/home/universities``
     - Управление вузами администратором.
   * - ``/home/users``
     - Управление пользователями администратором.
   * - ``/home/my-diplomas``
     - Дипломы студента.
   * - ``/home/account``
     - Настройки аккаунта.

API-клиент
----------

Общий helper находится в ``frontend/src/shared/api/http.ts``.

Особенности:

* API base URL по умолчанию пустой, запросы идут на текущий origin.
* Для всех запросов используется ``credentials: "include"``.
* Тело запроса сериализуется в JSON.
* Ошибки backend пробрасываются как ``Error`` с текстом из ``detail``.

Разработка
----------

Команды:

.. code-block:: bash

   cd frontend
   npm install
   npm run dev
   npm run lint
   npm run build

Vite proxy в ``frontend/vite.config.ts`` направляет ``/api`` на
``http://127.0.0.1:8000``.

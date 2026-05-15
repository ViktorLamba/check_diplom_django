# Сервис проверки дипломов

Full-stack приложение для учета и проверки подлинности дипломов. Система позволяет администраторам управлять вузами, вузам вести студентов и выпускать дипломы, студентам просматривать свои дипломы, а внешним пользователям проверять диплом по номеру/дате выдачи или публичной ссылке.

## Возможности

- Публичная проверка диплома без авторизации.
- Публичная страница диплома по UUID: `/diplom/:publicId`.
- Личный кабинет с ролями `admin`, `university`, `student`.
- Управление вузами и пользователями администратором.
- Управление студентами пользователем вуза.
- Создание и просмотр дипломов.
- Статусы дипломов: `valid` и `revoked`.
- Журнал проверок дипломов с источником проверки, IP, user-agent и результатом.
- Авторизация через Django sessions.
- Двухфакторная авторизация по email для пользователей вузов и студентов.
- Восстановление и смена пароля.
- Docker Compose для локального запуска и деплоя.
- CI/CD через GitHub Actions с публикацией Docker-образов и деплоем по SSH.

## Стек

### Backend

- Python 3.12
- Django 5
- PostgreSQL 16
- Django sessions
- Email-отправка через console backend в разработке или SMTP в окружении

### Frontend

- React 19
- TypeScript
- Vite
- React Router
- React Hook Form
- Zod
- Tailwind CSS 4
- Radix UI / shadcn-компоненты
- Lucide React
- SCSS modules

### Инфраструктура

- Docker / Docker Compose
- Nginx для production frontend
- GitHub Actions
- Docker Hub

## Структура проекта

```text
.
├── backend/                 # Django-проект
│   ├── apps/auth/           # Авторизация, 2FA, пароли
│   ├── apps/registry/       # Вузы, студенты, дипломы, проверки
│   ├── config/              # Настройки, URL, WSGI/ASGI
│   └── manage.py
├── frontend/                # React/Vite-приложение
│   ├── src/app/             # Инициализация и роутинг
│   ├── src/pages/           # Страницы приложения
│   ├── src/shared/          # Общие API, auth, типы
│   └── src/widgets/         # Виджеты интерфейса
├── docker-compose.yml       # Локальный backend + PostgreSQL + опциональный frontend
├── docker-compose.prod.yml  # Production compose
├── docker-compose.test.yml  # Дополнение для test-окружения
├── requirements.txt         # Python-зависимости
└── .github/workflows/       # CI/CD
```

## Роли

- `admin` - администратор Django/staff-пользователь. Управляет вузами, пользователями, видит дипломы и журнал проверок.
- `university` - пользователь вуза. Управляет студентами своего вуза, создает дипломы, видит свои дипломы и журнал проверок.
- `student` - студент. Видит свои дипломы.
- `user` - авторизованный пользователь без привязки к вузу или студенту.

## Локальный запуск через Docker

Запуск backend и PostgreSQL:

```bash
docker compose up -d
```

Опционально можно поднять frontend-контейнер:

```bash
docker compose --profile frontend up -d
```

Адреса:

- Backend: `http://localhost:8000`
- Django admin: `http://localhost:8000/admin/`
- Frontend: `http://localhost:3000`
- PostgreSQL на хосте: `localhost:5333`

Для полноценной frontend-разработки удобнее запускать Vite на хосте через `npm run dev`: текущий Vite proxy направляет `/api` на `http://127.0.0.1:8000`.

Остановка:

```bash
docker compose down
```

Создать администратора:

```bash
docker compose exec web python manage.py createsuperuser
```

Применить миграции вручную:

```bash
docker compose exec web python manage.py migrate
```

## Локальный запуск без Docker

Backend:

```bash
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
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

По умолчанию frontend отправляет запросы на тот же origin. В production это работает через Nginx proxy на `/api/`.

## Основные маршруты frontend

- `/home` - публичная главная страница.
- `/login` - вход.
- `/verification` - публичная проверка диплома.
- `/diplom/:publicId` - публичная страница диплома.
- `/home/dashboard` - дашборд для администратора и вуза.
- `/home/history` - журнал проверок.
- `/home/diplomas` - список дипломов.
- `/home/diplomas/create` - создание диплома вузом.
- `/home/students` - студенты вуза.
- `/home/universities` - управление вузами администратором.
- `/home/users` - управление пользователями администратором.
- `/home/my-diplomas` - дипломы студента.
- `/home/account` - настройки аккаунта.

## API

Все ответы API возвращаются в JSON. Для авторизованных запросов используется cookie-сессия Django.

### Авторизация: `/api/auth/`

- `POST /api/auth/login/` - вход по `username` и `password`.
- `POST /api/auth/login/verify/` - подтверждение 2FA-кода.
- `POST /api/auth/register/` - создание пользователя администратором.
- `POST /api/auth/change-password/` - смена пароля текущего пользователя.
- `POST /api/auth/password-reset/` - запрос ссылки восстановления пароля.
- `POST /api/auth/password-reset/confirm/` - установка нового пароля по `uid` и `token`.
- `POST /api/auth/logout/` - выход.
- `GET /api/auth/me/` - текущий пользователь.

Администраторы входят сразу. Для вузов и студентов после проверки пароля отправляется 6-значный код на email, код действует 10 минут.

### Реестр: `/api/`

- `GET /api/public/stats/` - публичная статистика.
- `GET /api/users/` - список пользователей для администратора или вуза.
- `DELETE /api/users/<user_id>/` - удаление пользователя администратором.
- `GET /api/universities/` - список вузов.
- `POST /api/universities/` - создание вуза администратором.
- `PUT|PATCH|DELETE /api/universities/<university_id>/` - изменение или удаление вуза.
- `GET /api/students/` - студенты текущего вуза.
- `POST /api/students/` - создание студента текущим вузом.
- `PUT|PATCH|DELETE /api/students/<student_id>/` - изменение или удаление студента.
- `GET /api/diplomas/` - список дипломов для администратора или вуза.
- `POST /api/diplomas/` - создание диплома текущим вузом.
- `POST /api/diplomas/verify/` - публичная проверка по номеру и дате выдачи.
- `GET /api/diplomas/verification-logs/` - журнал проверок.
- `GET /api/diplomas/my/` - дипломы текущего студента.
- `GET /api/diplom/<public_id>/` - публичная проверка диплома по UUID.

Списковые эндпоинты поддерживают пагинацию через `page` и `page_size`. Для списков также используются фильтры `search`, `status`, `role` или `source`, если они предусмотрены конкретным эндпоинтом.

## Переменные окружения

Backend ожидает обязательные параметры подключения к базе:

- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `DB_HOST`
- `DB_PORT`

Основные Django-настройки:

- `DJANGO_SECRET_KEY`
- `DJANGO_DEBUG`
- `DJANGO_ALLOWED_HOSTS` - список хостов через запятую, без портов.
- `FRONTEND_URL` - адрес frontend для ссылок восстановления пароля.

Email-настройки:

- `DJANGO_EMAIL_BACKEND`
- `DJANGO_EMAIL_HOST`
- `DJANGO_EMAIL_PORT`
- `DJANGO_EMAIL_HOST_USER`
- `DJANGO_EMAIL_HOST_PASSWORD`
- `DJANGO_EMAIL_USE_TLS`
- `DJANGO_EMAIL_USE_SSL`
- `DJANGO_DEFAULT_FROM_EMAIL`

В локальном `docker-compose.yml` переменные базы уже заданы. В production они передаются из `.env`, который формируется CD workflow.

## Тесты и проверки

Backend:

```bash
flake8 backend
python backend/manage.py makemigrations --check --dry-run
python backend/manage.py test apps.auth apps.registry
```

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## Документация Sphinx

Исходники документации находятся в `docs/source/`. Раздел документации кода
собирается Sphinx из русских docstring-ов backend-модулей через `autodoc`.

Сборка HTML:

```bash
python -m venv .venv-docs
source .venv-docs/bin/activate
pip install -r docs/requirements.txt
cd docs
make html
```

Готовая документация будет в `docs/build/html/`.

## CI/CD

### CI: `.github/workflows/ci.yml`

Workflow запускается на `push` во все ветки и на `pull_request`.

Job `lint-and-test`:

- поднимает PostgreSQL 16;
- устанавливает Python 3.12 и зависимости;
- запускает `flake8 backend`;
- проверяет миграции через `makemigrations --check --dry-run`;
- запускает Django-тесты `apps.auth` и `apps.registry`.

Job `build-and-push-images` выполняется только для push в `main` или `release`:

- `main` публикует теги `backend-prod` и `frontend-prod`;
- `release` публикует теги `backend-test` и `frontend-test`.
- дополнительно публикуется образ документации: `docs-prod` или `docs-test`.

### CD: `.github/workflows/cd.yml`

Workflow запускается после успешного CI для веток `main` и `release`.

- `main` деплоится как проект `check_prod`.
  - Frontend: порт `8010`
  - Backend/admin: порт `8020`
  - Sphinx-документация: порт `8030`
- `release` деплоится как проект `check_test`.
  - Frontend: порт `4999`
  - Backend/admin: порт `4998`
  - Sphinx-документация: порт `4997`
  - PostgreSQL дополнительно публикуется на порт `5433`

Деплой выполняется по SSH: сервер обновляет ветку, формирует `.env`, логинится в Docker Hub, подтягивает образы, пересоздает контейнеры и выполняет миграции.

## GitHub Secrets

Для CI/CD нужны:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DOCKERHUB_REPO`
- `SSH_HOST`
- `SSH_USER`
- `SSH_KEY`
- `DEPLOY_PATH`
- `DJANGO_ALLOWED_HOSTS_MAIN`
- `DJANGO_ALLOWED_HOSTS_RELEASE`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `DJANGO_SECRET_KEY`
- `DJANGO_EMAIL_BACKEND`
- `DJANGO_EMAIL_HOST`
- `DJANGO_EMAIL_PORT`
- `DJANGO_EMAIL_HOST_USER`
- `DJANGO_EMAIL_HOST_PASSWORD`
- `DJANGO_EMAIL_USE_TLS`
- `DJANGO_EMAIL_USE_SSL`
- `DJANGO_DEFAULT_FROM_EMAIL`

Если Django возвращает `DisallowedHost`, добавьте домен или IP в `DJANGO_ALLOWED_HOSTS_MAIN` или `DJANGO_ALLOWED_HOSTS_RELEASE`. Порт указывать не нужно.

Пример:

```text
138.124.61.62,localhost,127.0.0.1
```

## Разработчики

- Telegram: [@vitiokrnd](https://t.me/vitiokrnd)
- Telegram: [@andrew09127](https://t.me/andrew09127)
- Telegram: [@Semen_Mel](https://t.me/Semen_Mel)

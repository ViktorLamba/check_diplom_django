# check_diplom_django

Монолитный проект для проверки дипломов:
- backend: Django (`backend/`)
- frontend: Vite + React (`frontend/`)
- БД: PostgreSQL

## Стек
- Python 3.12
- Django 5
- Node.js (frontend)
- Docker / Docker Compose
- GitHub Actions (`ci` и `cd`)

## Структура
- `backend/` — Django-приложение
- `frontend/` — фронтенд
- `docker-compose.yml` — локальная разработка
- `docker-compose.prod.yml` — деплой на сервер
- `.github/workflows/ci.yml` — тесты, линт, сборка и push образов
- `.github/workflows/cd.yml` — автодеплой после успешного CI

## Локальный запуск (Docker)
```bash
docker compose up -d
```

Сервисы:
- backend: `http://localhost:8000`
- frontend: `http://localhost:3000`
- postgres: `localhost:5333`

Остановить:
```bash
docker compose down
```

## Django admin (локально)
Создать администратора:
```bash
docker compose exec web python manage.py createsuperuser
```

Открыть:
- `http://localhost:8000/admin/`

## API авторизации
Базовый префикс:
- `/api/auth/`

Эндпоинты:
- `POST /api/auth/login/`
- `POST /api/auth/login/verify/`
- `POST /api/auth/register/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`

Важно:
- `register` доступен только авторизованному администратору.

## CI/CD
### CI (`.github/workflows/ci.yml`)
- запускается на `push` и `pull_request`
- `lint-and-test`:
  - установка зависимостей
  - `flake8 backend`
  - `python backend/manage.py test`
- `build-and-push-images`:
  - только для `main` и `release`
  - push Docker-образов в Docker Hub:
    - `backend-prod` / `frontend-prod` для `main`
    - `backend-test` / `frontend-test` для `release`

### CD (`.github/workflows/cd.yml`)
- запускается после успешного `ci`
- деплой по SSH на сервер
- тянет образы из Docker Hub и поднимает `docker-compose.prod.yml`

Порты:
- `main` (prod):
  - frontend: `8010`
  - backend/admin: `8020`
- `release` (test):
  - frontend: `4999`
  - backend/admin: `4998`

## GitHub Secrets
Нужные secrets:
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `DOCKERHUB_REPO` (пример: `username/check_diplom_django`)
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

## Django DisallowedHost
Если видишь `DisallowedHost`, добавь IP/домен в:
- `DJANGO_ALLOWED_HOSTS_MAIN` или `DJANGO_ALLOWED_HOSTS_RELEASE`

Пример:
```text
138.124.61.62,localhost,127.0.0.1
```

Порт в `ALLOWED_HOSTS` указывать не нужно.

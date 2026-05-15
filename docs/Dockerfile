FROM python:3.12-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt ./requirements.txt
COPY docs/requirements.txt ./docs/requirements.txt
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r docs/requirements.txt

COPY backend ./backend
COPY docs ./docs

WORKDIR /app/docs
RUN make html

FROM nginx:alpine

COPY --from=builder /app/docs/build/html /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

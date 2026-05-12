import os
import django
import uuid
from django.contrib.auth import get_user_model

# Настройка Django окружения
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from diplomas.models import DiplomaSubmission
from diplomas.utils import hash_diploma_number

# Тестовые данные
test_diplomas = [
    {
        'full_name': 'Иван Иванов',
        'diploma_series': 'AA',
        'diploma_number': '123456',
        'photo_path': None
    },
    {
        'full_name': 'Мария Петрова',
        'diploma_series': 'BB',
        'diploma_number': '789012',
        'photo_path': None
    },
    {
        'full_name': 'Сергей Сидоров',
        'diploma_series': 'CC',
        'diploma_number': '345678',
        'photo_path': None
    },
    {
        'full_name': 'Елена Смирнова',
        'diploma_series': 'DD',
        'diploma_number': '901234',
        'photo_path': None
    },
    {
        'full_name': 'Алексей Козлов',
        'diploma_series': 'EE',
        'diploma_number': '567890',
        'photo_path': None
    },
]

def create_test_diplomas():
    """Создание тестовых записей дипломов"""
    print("Создание тестовых записей...")
    
    for data in test_diplomas:
        # Хэшируем серию+номер
        raw_series_number = f"{data['diploma_series']}{data['diploma_number']}"
        diploma_hash = hash_diploma_number(raw_series_number, 'test-salt')
        
        # Создаём запись
        submission = DiplomaSubmission.objects.create(
            full_name=data['full_name'],
            diploma_hash=diploma_hash
        )
        
        print(f"  ✓ Создано: {submission.full_name} (ID: {submission.id}, хэш: {submission.diploma_hash[:16]}...)")
    
    print(f"\n✅ Всего создано записей: {DiplomaSubmission.objects.count()}")

def list_all_diplomas():
    """Вывод всех записей"""
    print("\n📋 Список всех дипломов:")
    print("-" * 80)
    
    for sub in DiplomaSubmission.objects.all():
        print(f"ID: {sub.id}")
        print(f"ФИО: {sub.full_name}")
        print(f"Хэш диплома: {sub.diploma_hash}")
        print(f"Создан: {sub.created_at}")
        print("-" * 40)

if __name__ == "__main__":
    create_test_diplomas()
    list_all_diplomas()
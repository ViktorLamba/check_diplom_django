import hashlib
import uuid
import os
from django.db import models
from django.conf import settings

def diploma_photo_path(instance, filename):
    """Путь для сохранения фото: diploma_photos/год/месяц/uuid_файла"""
    ext = filename.split('.')[-1]
    hash_name = hashlib.md5(filename.encode() + os.urandom(32)).hexdigest()
    return f'diploma_photos/{instance.created_at.year}/{instance.created_at.month}/{hash_name}.{ext}'

class DiplomaSubmission(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name = models.CharField(max_length=200, db_index=True, verbose_name='ФИО')
    diploma_hash = models.CharField(max_length=128, unique=True, db_index=True)
    photo = models.ImageField(upload_to=diploma_photo_path, blank=True, null=True)
    photo_hash = models.CharField(max_length=64, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['full_name']),
            models.Index(fields=['diploma_hash']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f'{self.full_name} - {self.diploma_hash[:8]}'

class DiplomaPhoto(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    submission = models.ForeignKey(DiplomaSubmission, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to=diploma_photo_path)
    file_hash = models.CharField(max_length=64, blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order']
        indexes = [
            models.Index(fields=['submission', 'order']),
        ]

    def __str__(self):
        return f'Photo for {self.submission.full_name}'
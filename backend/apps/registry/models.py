import uuid

from django.conf import settings
from django.db import models


class University(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='university',
    )
    name = models.CharField(max_length=255, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('name',)
        verbose_name = 'University'
        verbose_name_plural = 'Universities'

    def __str__(self):
        return self.name


class Student(models.Model):
    STATUS_ACTIVE = 'active'
    STATUS_INACTIVE = 'inactive'
    STATUS_CHOICES = (
        (STATUS_ACTIVE, 'Active'),
        (STATUS_INACTIVE, 'Inactive'),
    )

    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name='students',
    )
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student',
        blank=True,
        null=True,
    )
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    group = models.CharField(max_length=64)
    course = models.PositiveSmallIntegerField()
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at', '-id')
        indexes = [
            models.Index(fields=('university', 'status')),
            models.Index(fields=('university', 'full_name')),
            models.Index(fields=('university', 'email')),
        ]
        constraints = [
            models.UniqueConstraint(fields=('university', 'email'), name='unique_student_email_per_university'),
        ]

    def __str__(self):
        return self.full_name


class Diploma(models.Model):
    STATUS_VALID = 'valid'
    STATUS_REVOKED = 'revoked'
    STATUS_CHOICES = (
        (STATUS_VALID, 'Valid'),
        (STATUS_REVOKED, 'Revoked'),
    )

    university = models.ForeignKey(
        University,
        on_delete=models.CASCADE,
        related_name='diplomas',
    )
    public_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    student = models.ForeignKey(
        Student,
        on_delete=models.CASCADE,
        related_name='diplomas',
    )
    number = models.CharField(max_length=64)
    speciality = models.CharField(max_length=255)
    qualification = models.CharField(max_length=255)
    issued_at = models.DateField()
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_VALID)
    qr_code_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-issued_at', '-id')
        indexes = [
            models.Index(fields=('university', 'number')),
            models.Index(fields=('student',)),
        ]
        constraints = [
            models.UniqueConstraint(fields=('university', 'number'), name='unique_diploma_number_per_university'),
        ]

    def __str__(self):
        return self.number


class DiplomaVerificationLog(models.Model):
    SOURCE_FORM = 'form'
    SOURCE_PUBLIC = 'public'
    SOURCE_CHOICES = (
        (SOURCE_FORM, 'Form'),
        (SOURCE_PUBLIC, 'Public page'),
    )

    STATUS_VERIFIED = 'verified'
    STATUS_REVOKED = Diploma.STATUS_REVOKED
    STATUS_NOT_FOUND = 'not_found'
    STATUS_CHOICES = (
        (STATUS_VERIFIED, 'Verified'),
        (STATUS_REVOKED, 'Revoked'),
        (STATUS_NOT_FOUND, 'Not found'),
    )

    diploma = models.ForeignKey(
        Diploma,
        on_delete=models.SET_NULL,
        related_name='verification_logs',
        blank=True,
        null=True,
    )
    university = models.ForeignKey(
        University,
        on_delete=models.SET_NULL,
        related_name='verification_logs',
        blank=True,
        null=True,
    )
    source = models.CharField(max_length=16, choices=SOURCE_CHOICES)
    requested_series = models.CharField(max_length=64, blank=True)
    requested_number = models.CharField(max_length=64, blank=True)
    requested_issued_at = models.DateField(blank=True, null=True)
    requested_public_id = models.UUIDField(blank=True, null=True)
    verification_status = models.CharField(max_length=16, choices=STATUS_CHOICES)
    verified = models.BooleanField(default=False)
    requester_ip = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-created_at', '-id')
        indexes = [
            models.Index(fields=('university', '-created_at')),
            models.Index(fields=('diploma', '-created_at')),
            models.Index(fields=('verification_status', '-created_at')),
        ]

    def __str__(self):
        return f'{self.verification_status} at {self.created_at:%Y-%m-%d %H:%M:%S}'

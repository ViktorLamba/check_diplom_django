"""Настройки Django admin для реестра дипломов."""

from django.contrib import admin

from .models import Diploma, DiplomaVerificationLog, Student, University


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    """Административный интерфейс вузов."""

    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username', 'user__email')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """Административный интерфейс студентов."""

    list_display = ('full_name', 'email', 'group', 'course', 'status', 'university', 'user')
    list_filter = ('status', 'course', 'university')
    search_fields = ('full_name', 'email', 'group', 'user__username')


@admin.register(Diploma)
class DiplomaAdmin(admin.ModelAdmin):
    """Административный интерфейс дипломов."""

    list_display = ('number', 'student', 'university', 'speciality', 'qualification', 'issued_at', 'status')
    list_filter = ('status', 'issued_at', 'university')
    search_fields = ('number', 'student__full_name', 'speciality', 'qualification')


@admin.register(DiplomaVerificationLog)
class DiplomaVerificationLogAdmin(admin.ModelAdmin):
    """Административный интерфейс журнала проверок дипломов."""

    list_display = ('created_at', 'verification_status', 'source', 'verified', 'diploma', 'university', 'requested_number')
    list_filter = ('verification_status', 'source', 'verified', 'university')
    search_fields = ('requested_series', 'requested_number', 'diploma__number', 'diploma__student__full_name')
    readonly_fields = (
        'diploma',
        'university',
        'source',
        'requested_series',
        'requested_number',
        'requested_issued_at',
        'requested_public_id',
        'verification_status',
        'verified',
        'requester_ip',
        'user_agent',
        'created_at',
    )

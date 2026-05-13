from django.contrib import admin

from .models import Diploma, Student, University


@admin.register(University)
class UniversityAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'created_at')
    search_fields = ('name', 'user__username', 'user__email')


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'group', 'course', 'status', 'university', 'user')
    list_filter = ('status', 'course', 'university')
    search_fields = ('full_name', 'email', 'group', 'user__username')


@admin.register(Diploma)
class DiplomaAdmin(admin.ModelAdmin):
    list_display = ('number', 'student', 'university', 'speciality', 'qualification', 'issued_at', 'status')
    list_filter = ('status', 'issued_at', 'university')
    search_fields = ('number', 'student__full_name', 'speciality', 'qualification')

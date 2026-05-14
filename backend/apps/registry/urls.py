from django.urls import path

from .views import (
    diploma_verify_view,
    diploma_verification_logs_view,
    diplomas_view,
    my_diplomas_view,
    public_diploma_view,
    student_detail_view,
    students_view,
    universities_view,
    university_detail_view,
)

urlpatterns = [
    path('universities/', universities_view, name='universities'),
    path('universities/<int:university_id>/', university_detail_view, name='university_detail'),
    path('students/', students_view, name='students'),
    path('students/<int:student_id>/', student_detail_view, name='student_detail'),
    path('diplomas/', diplomas_view, name='diplomas'),
    path('diplomas/verify/', diploma_verify_view, name='diploma_verify'),
    path('diplomas/verification-logs/', diploma_verification_logs_view, name='diploma_verification_logs'),
    path('diplomas/my/', my_diplomas_view, name='my_diplomas'),
    path('diplom/<uuid:public_id>/', public_diploma_view, name='public_diploma'),
]

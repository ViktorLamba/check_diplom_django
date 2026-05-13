from django.urls import path

from .views import (
    diplomas_view,
    my_diplomas_view,
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
    path('diplomas/my/', my_diplomas_view, name='my_diplomas'),
]

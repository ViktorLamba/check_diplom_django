from django.urls import path
from .views import DiplomaCreateAPIView

urlpatterns = [
    path('submit/', DiplomaCreateAPIView.as_view(), name='diploma-submit'),
]
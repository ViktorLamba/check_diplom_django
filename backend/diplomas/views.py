from django.shortcuts import render

from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import DiplomaSubmissionSerializer

class DiplomaCreateAPIView(generics.CreateAPIView):
    serializer_class = DiplomaSubmissionSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            self.perform_create(serializer)
            return Response({"status": "ok", "id": serializer.instance.id}, 
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
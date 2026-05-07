from rest_framework import serializers
from .models import DiplomaSubmission, DiplomaPhoto
from .utils import hash_diploma_number
from django.conf import settings

class DiplomaPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DiplomaPhoto
        fields = ['id', 'image', 'order']

class DiplomaSubmissionSerializer(serializers.ModelSerializer):
    # Входные поля: серия и номер (не сохраняются в БД)
    diploma_series = serializers.CharField(write_only=True)
    diploma_number = serializers.CharField(write_only=True)
    # Фото – может быть несколько
    photos = serializers.ListField(
        child=serializers.ImageField(), write_only=True, required=False
    )

    class Meta:
        model = DiplomaSubmission
        fields = ['id', 'full_name', 'diploma_series', 'diploma_number', 
                  'photo', 'photos', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        series = data.get('diploma_series')
        number = data.get('diploma_number')
        if not series or not number:
            raise serializers.ValidationError("Серия и номер диплома обязательны")
        # Доп. валидация формата при необходимости
        return data

    def create(self, validated_data):
        series = validated_data.pop('diploma_series')
        number = validated_data.pop('diploma_number')
        raw_series_number = f"{series}{number}"  # или с пробелом/дефисом
        diploma_hash = hash_diploma_number(raw_series_number, settings.DIPLOMA_HASH_SALT)

        # Если диплом с таким хэшем уже есть – по логике можно либо вернуть существующий,
        # либо выдать ошибку. Выберем ошибку, чтобы не было дублей.
        if DiplomaSubmission.objects.filter(diploma_hash=diploma_hash).exists():
            raise serializers.ValidationError("Диплом с такими серией и номером уже зарегистрирован")

        photos = validated_data.pop('photos', [])
        # Основное фото (первое из списка)
        main_photo = photos[0] if photos else None

        submission = DiplomaSubmission.objects.create(
            full_name=validated_data['full_name'],
            diploma_hash=diploma_hash,
            photo=main_photo,
        )

        # Сохраняем остальные фото в связанную модель DiplomaPhoto
        for idx, img in enumerate(photos[1:]):
            DiplomaPhoto.objects.create(submission=submission, image=img, order=idx+1)

        # Вычисляем хэш для каждого фото (опционально)
        # for photo in submission.photos.all():
        #     photo.file_hash = hash_file(photo.image.path)
        #     photo.save()

        return submission
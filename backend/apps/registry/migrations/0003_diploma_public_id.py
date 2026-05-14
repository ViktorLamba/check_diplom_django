import uuid

from django.db import migrations, models


def fill_public_ids(apps, schema_editor):
    Diploma = apps.get_model('registry', 'Diploma')
    for diploma in Diploma.objects.filter(public_id__isnull=True):
        diploma.public_id = uuid.uuid4()
        diploma.save(update_fields=['public_id'])


class Migration(migrations.Migration):

    dependencies = [
        ('registry', '0002_student_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='diploma',
            name='public_id',
            field=models.UUIDField(blank=True, editable=False, null=True),
        ),
        migrations.RunPython(fill_public_ids, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='diploma',
            name='public_id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]

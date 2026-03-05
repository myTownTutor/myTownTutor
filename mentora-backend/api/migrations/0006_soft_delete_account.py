from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_otp_email_verification'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='user',
            name='deleted_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='user',
            name='original_email',
            field=models.EmailField(blank=True, null=True, max_length=254),
        ),
    ]

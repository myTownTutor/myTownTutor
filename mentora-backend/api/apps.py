from django.apps import AppConfig


class ApiConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'api'

    def ready(self):
        from django.db.models.signals import post_migrate
        post_migrate.connect(create_super_admin, sender=self)


def create_super_admin(sender, **kwargs):
    """Seed default super admin account after migrations run."""
    try:
        from api.models import User
        admin_email = 'admin@mentora.com'
        if not User.objects.filter(email=admin_email).exists():
            User.objects.create_user(
                email=admin_email,
                first_name='Admin',
                last_name='User',
                role='super_admin',
                password='admin123',
                is_staff=True,
                is_superuser=True,
            )
            print(f"Created super admin: {admin_email}")
    except Exception as e:
        # Table may not exist yet during initial migration
        pass

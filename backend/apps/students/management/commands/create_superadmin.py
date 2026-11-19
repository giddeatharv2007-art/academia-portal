"""
Create superadmin user
Usage: python manage.py create_superadmin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Create the default superadmin user'

    def handle(self, *args, **kwargs):
        email = 'admin@edunexus.in'
        password = 'Admin@123'

        if User.objects.filter(email=email).exists():
            self.stdout.write(self.style.WARNING(f'Superadmin {email} already exists.'))
            return

        user = User.objects.create_superuser(
            email=email,
            password=password,
        )
        self.stdout.write(self.style.SUCCESS(f'Superadmin created: {email} / {password}'))

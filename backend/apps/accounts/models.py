"""
Accounts Models - Custom User with role-based authentication
"""
import uuid
import random
import string
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('is_email_verified', True)
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    class Role(models.TextChoices):
        STUDENT  = 'student',  'Student'
        COMPANY  = 'company',  'Company'
        COLLEGE  = 'college',  'College'
        ADMIN    = 'admin',    'Admin'
        ADVISOR  = 'advisor',  'Admissions Advisor'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True, db_index=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.STUDENT)

    # Verification
    is_email_verified = models.BooleanField(default=False)
    email_verification_token = models.CharField(max_length=64, blank=True, null=True)
    email_verification_token_created = models.DateTimeField(blank=True, null=True)

    # OTP for company registration
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_created_at = models.DateTimeField(blank=True, null=True)
    otp_verified = models.BooleanField(default=False)

    # Status
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)
    last_login = models.DateTimeField(blank=True, null=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return f"{self.email} ({self.role})"

    def generate_verification_token(self):
        import secrets
        token = secrets.token_urlsafe(32)
        self.email_verification_token = token
        self.email_verification_token_created = timezone.now()
        self.save(update_fields=['email_verification_token', 'email_verification_token_created'])
        return token

    def generate_otp(self):
        otp = ''.join(random.choices(string.digits, k=6))
        self.otp_code = otp
        self.otp_created_at = timezone.now()
        self.otp_verified = False
        self.save(update_fields=['otp_code', 'otp_created_at', 'otp_verified'])
        return otp

    def is_otp_valid(self, otp):
        if not self.otp_code or not self.otp_created_at:
            return False
        # OTP valid for 10 minutes
        elapsed = (timezone.now() - self.otp_created_at).total_seconds()
        return self.otp_code == otp and elapsed < 600

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_company(self):
        return self.role == self.Role.COMPANY

    @property
    def is_college(self):
        return self.role == self.Role.COLLEGE

    @property
    def is_admin_user(self):
        return self.role == self.Role.ADMIN

    @property
    def is_advisor(self):
        return self.role == self.Role.ADVISOR

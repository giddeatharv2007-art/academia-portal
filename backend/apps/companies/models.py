"""
Companies Models
"""
import uuid
from django.db import models
from django.conf import settings


class CompanyProfile(models.Model):
    class Domain(models.TextChoices):
        IT = 'it', 'IT'
        HEALTHCARE = 'healthcare', 'Healthcare'
        IOT = 'iot', 'IoT'
        FINANCE = 'finance', 'Finance'
        EDTECH = 'edtech', 'EdTech'
        AI = 'ai', 'AI/ML'
        MANUFACTURING = 'manufacturing', 'Manufacturing'
        CYBERSECURITY = 'cybersecurity', 'Cybersecurity'
        ECOMMERCE = 'ecommerce', 'E-Commerce'
        CONSULTING = 'consulting', 'Consulting'
        MEDIA = 'media', 'Media & Entertainment'
        OTHER = 'other', 'Other'

    class TargetHiring(models.TextChoices):
        INTERNSHIP = 'internship', 'Internship Only'
        JOB = 'job', 'Job Only'
        BOTH = 'both', 'Both'

    class VerificationStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='company_profile'
    )

    # Company Info
    name = models.CharField(max_length=200)
    logo = models.ImageField(upload_to='company_logos/', null=True, blank=True)
    about = models.TextField(blank=True)
    location = models.CharField(max_length=200, blank=True)
    website = models.URLField(blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    domain = models.CharField(max_length=30, choices=Domain.choices, default=Domain.OTHER)
    target_hiring = models.CharField(
        max_length=20, choices=TargetHiring.choices, default=TargetHiring.BOTH
    )
    employee_count = models.CharField(max_length=50, blank=True)  # "1-10", "50-200" etc.

    # Registration
    registration_number = models.CharField(max_length=100, blank=True)
    gstin = models.CharField(max_length=15, blank=True)

    # Contact Person
    contact_person_name = models.CharField(max_length=200, blank=True)
    contact_person_designation = models.CharField(max_length=100, blank=True)
    contact_person_email = models.EmailField(blank=True)
    contact_person_phone = models.CharField(max_length=15, blank=True)

    # Required Skills (general company skills)
    required_skills = models.ManyToManyField(
        'skills.Skill',
        through='CompanyRequiredSkill',
        related_name='companies'
    )

    # Verification
    verification_status = models.CharField(
        max_length=20,
        choices=VerificationStatus.choices,
        default=VerificationStatus.PENDING
    )
    is_verified = models.BooleanField(default=False)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_companies'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'company_profiles'
        verbose_name = 'Company Profile'

    def __str__(self):
        return f"{self.name} ({self.verification_status})"


class CompanyRequiredSkill(models.Model):
    class Priority(models.TextChoices):
        REQUIRED = 'required', 'Required'
        PREFERRED = 'preferred', 'Preferred'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(CompanyProfile, on_delete=models.CASCADE, related_name='company_skills')
    skill = models.ForeignKey('skills.Skill', on_delete=models.CASCADE, related_name='company_requirements')
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.REQUIRED)

    class Meta:
        db_table = 'company_required_skills'
        unique_together = ('company', 'skill')

    def __str__(self):
        return f"{self.company.name} - {self.skill.name} ({self.priority})"


class CompanyVerification(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.OneToOneField(
        CompanyProfile, on_delete=models.CASCADE, related_name='verification'
    )
    submitted_docs = models.JSONField(default=list)  # list of doc URLs
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='reviewed_companies'
    )
    review_notes = models.TextField(blank=True)
    reviewed_at = models.DateTimeField(null=True, blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'company_verifications'

    def __str__(self):
        return f"{self.company.name} - {self.status}"

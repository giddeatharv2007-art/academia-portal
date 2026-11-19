"""
Students Models
"""
import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class StudentProfile(models.Model):
    class Status(models.TextChoices):
        STUDENT = 'student', 'Student'
        EMPLOYEE = 'employee', 'Employee'
        INTERN = 'intern', 'Intern'
        OTHER = 'other', 'Other'

    class WorkMode(models.TextChoices):
        REMOTE = 'remote', 'Remote'
        HYBRID = 'hybrid', 'Hybrid'
        ONSITE = 'onsite', 'On-site'
        ANY = 'any', 'Any'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )

    # Personal Info
    full_name = models.CharField(max_length=200)
    mobile = models.CharField(max_length=15, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    pin_code = models.CharField(max_length=10, blank=True)
    profile_photo = models.ImageField(upload_to='student_photos/', null=True, blank=True)
    current_status = models.CharField(max_length=20, choices=Status.choices, default=Status.STUDENT)

    # Academic Info
    college_name = models.CharField(max_length=300, blank=True)
    university = models.CharField(max_length=300, blank=True)
    degree = models.CharField(max_length=100, blank=True)
    branch = models.CharField(max_length=100, blank=True)
    current_year = models.PositiveIntegerField(null=True, blank=True)
    graduation_year = models.PositiveIntegerField(null=True, blank=True)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)

    # Portfolio Links
    github_url = models.URLField(blank=True)
    linkedin_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    other_links = models.JSONField(default=list, blank=True)

    # Preferences
    preferred_work_mode = models.CharField(
        max_length=20, choices=WorkMode.choices, default=WorkMode.ANY
    )
    preferred_cities = models.JSONField(default=list, blank=True)  # ['Pune', 'Mumbai']
    expected_stipend_min = models.PositiveIntegerField(null=True, blank=True)
    expected_stipend_max = models.PositiveIntegerField(null=True, blank=True)

    # Career Goal
    career_goal = models.CharField(max_length=200, blank=True)

    # Computed Scores (updated by signals/tasks)
    job_readiness_score = models.FloatField(default=0.0)
    profile_completion = models.FloatField(default=0.0)

    # Education verified by college
    is_education_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_profiles'
        verbose_name = 'Student Profile'

    def __str__(self):
        return f"{self.full_name} - {self.college_name}"

    def calculate_profile_completion(self):
        """Calculate profile completion percentage."""
        fields = [
            self.full_name, self.mobile, self.date_of_birth,
            self.city, self.state, self.college_name,
            self.degree, self.branch, self.graduation_year,
            self.cgpa, self.github_url, self.career_goal,
        ]
        filled = sum(1 for f in fields if f)
        has_skills = self.student_skills.exists()
        has_projects = self.projects.exists()

        score = (filled / len(fields)) * 70
        if has_skills:
            score += 15
        if has_projects:
            score += 15

        self.profile_completion = round(min(score, 100), 1)
        self.save(update_fields=['profile_completion'])
        return self.profile_completion


class EducationCertificate(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        StudentProfile, on_delete=models.CASCADE, related_name='education_certificates'
    )
    file = models.FileField(upload_to='education_certs/')
    degree = models.CharField(max_length=100)
    institution = models.CharField(max_length=300)
    year = models.PositiveIntegerField()
    description = models.TextField(blank=True)

    # Verification
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_certificates'
    )
    verified_at = models.DateTimeField(null=True, blank=True)
    rejection_notes = models.TextField(blank=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'education_certificates'

    def __str__(self):
        return f"{self.student.full_name} - {self.degree} @ {self.institution}"


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=200)
    description = models.TextField()
    technologies = models.JSONField(default=list)  # ['Python', 'Django', 'React']
    github_url = models.URLField(blank=True)
    demo_url = models.URLField(blank=True)
    role = models.CharField(max_length=100, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.full_name} - {self.name}"


class Certification(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='certifications')
    name = models.CharField(max_length=200)
    issuing_organization = models.CharField(max_length=200)
    issue_date = models.DateField()
    expiry_date = models.DateField(null=True, blank=True)
    certificate_url = models.URLField(blank=True)
    certificate_file = models.FileField(upload_to='certifications/', null=True, blank=True)
    credential_id = models.CharField(max_length=200, blank=True)

    # Verification
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_certifications'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'certifications'
        ordering = ['-issue_date']

    def __str__(self):
        return f"{self.student.full_name} - {self.name}"


class InternshipExperience(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        VERIFIED = 'verified', 'Verified'
        REJECTED = 'rejected', 'Rejected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='internship_experiences')
    company_name = models.CharField(max_length=200)
    role = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField(blank=True)
    skills_used = models.JSONField(default=list)
    certificate = models.FileField(upload_to='internship_certs/', null=True, blank=True)
    stipend = models.PositiveIntegerField(null=True, blank=True)

    # Verification
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_internships'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'internship_experiences'
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.student.full_name} - {self.role} @ {self.company_name}"

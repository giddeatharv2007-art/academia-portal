"""
Colleges Models
"""
import uuid
from django.db import models
from django.conf import settings


class CollegeProfile(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='college_profile'
    )
    name = models.CharField(max_length=300)
    location = models.CharField(max_length=200, blank=True)
    established_year = models.PositiveIntegerField(null=True, blank=True)
    affiliation = models.CharField(max_length=300, blank=True)  # University affiliation
    website = models.URLField(blank=True)
    logo = models.ImageField(upload_to='college_logos/', null=True, blank=True)
    admin_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=15, blank=True)
    about = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'college_profiles'

    def __str__(self):
        return self.name


class TrainingProgram(models.Model):
    class Status(models.TextChoices):
        UPCOMING = 'upcoming', 'Upcoming'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    college = models.ForeignKey(CollegeProfile, on_delete=models.CASCADE, related_name='training_programs')
    title = models.CharField(max_length=200)
    description = models.TextField()
    target_skills = models.ManyToManyField('skills.Skill', related_name='training_programs')
    target_year = models.CharField(max_length=50, blank=True)  # "2nd/3rd year CSE"
    reason = models.TextField(blank=True)
    instructor = models.CharField(max_length=200, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    max_participants = models.PositiveIntegerField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.UPCOMING)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'training_programs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.college.name} - {self.title}"


class TrainingEnrollment(models.Model):
    class Status(models.TextChoices):
        ENROLLED = 'enrolled', 'Enrolled'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        DROPPED = 'dropped', 'Dropped'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.StudentProfile',
        on_delete=models.CASCADE,
        related_name='training_enrollments'
    )
    program = models.ForeignKey(TrainingProgram, on_delete=models.CASCADE, related_name='enrollments')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ENROLLED)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    certificate = models.FileField(upload_to='training_certs/', null=True, blank=True)
    assessment_score = models.FloatField(null=True, blank=True)

    class Meta:
        db_table = 'training_enrollments'
        unique_together = ('student', 'program')

    def __str__(self):
        return f"{self.student.full_name} - {self.program.title}"

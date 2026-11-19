"""
Jobs and Internships Models + Application
"""
import uuid
from django.db import models
from django.conf import settings


class Job(models.Model):
    class JobType(models.TextChoices):
        FULL_TIME = 'full_time', 'Full Time'
        PART_TIME = 'part_time', 'Part Time'
        CONTRACT = 'contract', 'Contract'
        FREELANCE = 'freelance', 'Freelance'

    class WorkMode(models.TextChoices):
        REMOTE = 'remote', 'Remote'
        HYBRID = 'hybrid', 'Hybrid'
        ONSITE = 'onsite', 'On-site'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.CompanyProfile',
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    job_type = models.CharField(max_length=20, choices=JobType.choices, default=JobType.FULL_TIME)
    location = models.CharField(max_length=200, blank=True)
    work_mode = models.CharField(max_length=20, choices=WorkMode.choices, default=WorkMode.ONSITE)
    salary_min = models.PositiveIntegerField(null=True, blank=True)
    salary_max = models.PositiveIntegerField(null=True, blank=True)
    experience_min = models.PositiveIntegerField(default=0)  # years
    experience_max = models.PositiveIntegerField(null=True, blank=True)
    qualification = models.CharField(max_length=200, blank=True)
    required_skills = models.ManyToManyField(
        'skills.Skill', related_name='required_for_jobs', blank=True
    )
    preferred_skills = models.ManyToManyField(
        'skills.Skill', related_name='preferred_for_jobs', blank=True
    )
    deadline = models.DateField(null=True, blank=True)
    openings = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'jobs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company.name} - {self.title}"


class Internship(models.Model):
    class WorkMode(models.TextChoices):
        REMOTE = 'remote', 'Remote'
        HYBRID = 'hybrid', 'Hybrid'
        ONSITE = 'onsite', 'On-site'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.CompanyProfile',
        on_delete=models.CASCADE,
        related_name='internships'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    duration_months = models.PositiveIntegerField(default=3)
    stipend_min = models.PositiveIntegerField(null=True, blank=True)
    stipend_max = models.PositiveIntegerField(null=True, blank=True)
    location = models.CharField(max_length=200, blank=True)
    work_mode = models.CharField(max_length=20, choices=WorkMode.choices, default=WorkMode.ONSITE)
    required_skills = models.ManyToManyField(
        'skills.Skill', related_name='required_for_internships', blank=True
    )
    preferred_skills = models.ManyToManyField(
        'skills.Skill', related_name='preferred_for_internships', blank=True
    )
    qualification = models.CharField(max_length=200, blank=True)
    deadline = models.DateField(null=True, blank=True)
    openings = models.PositiveIntegerField(default=1)
    perks = models.JSONField(default=list, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'internships'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company.name} - {self.title}"


class Application(models.Model):
    class Status(models.TextChoices):
        APPLIED = 'applied', 'Applied'
        UNDER_REVIEW = 'under_review', 'Under Review'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        INTERVIEW = 'interview', 'Interview Scheduled'
        SELECTED = 'selected', 'Selected'
        REJECTED = 'rejected', 'Rejected'
        WITHDRAWN = 'withdrawn', 'Withdrawn'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.StudentProfile',
        on_delete=models.CASCADE,
        related_name='applications'
    )
    job = models.ForeignKey(
        Job, null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    internship = models.ForeignKey(
        Internship, null=True, blank=True,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    challenge = models.ForeignKey(
        'challenges.IndustryChallenge', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='applications'
    )

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.APPLIED)
    cover_letter = models.TextField(blank=True)

    # Rejection / Feedback
    rejection_reason = models.TextField(blank=True)
    rejection_tags = models.JSONField(default=list, blank=True)
    company_notes = models.TextField(blank=True)

    # Matching score at time of application
    match_score = models.FloatField(null=True, blank=True)

    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'applications'
        ordering = ['-applied_at']
        # A student can only apply once per job/internship
        constraints = [
            models.UniqueConstraint(
                fields=['student', 'job'],
                condition=models.Q(job__isnull=False),
                name='unique_student_job_application'
            ),
            models.UniqueConstraint(
                fields=['student', 'internship'],
                condition=models.Q(internship__isnull=False),
                name='unique_student_internship_application'
            ),
        ]

    def __str__(self):
        target = self.job or self.internship or self.challenge
        return f"{self.student.full_name} → {target} ({self.status})"

    def clean(self):
        from django.core.exceptions import ValidationError
        if not any([self.job, self.internship, self.challenge]):
            raise ValidationError('Application must be for a job, internship or challenge.')


class CompanyFeedback(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    application = models.OneToOneField(Application, on_delete=models.CASCADE, related_name='feedback')
    company = models.ForeignKey(
        'companies.CompanyProfile', on_delete=models.CASCADE, related_name='feedback_given'
    )
    student = models.ForeignKey(
        'students.StudentProfile', on_delete=models.CASCADE, related_name='company_feedbacks'
    )

    technical_score = models.PositiveIntegerField(default=0, validators=[__import__('django.core.validators', fromlist=['MaxValueValidator']).MaxValueValidator(5)])
    communication_score = models.PositiveIntegerField(default=0)
    teamwork_score = models.PositiveIntegerField(default=0)
    problem_solving_score = models.PositiveIntegerField(default=0)
    attitude_score = models.PositiveIntegerField(default=0)
    comments = models.TextField(blank=True)
    would_rehire = models.BooleanField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'company_feedback'

    def __str__(self):
        return f"Feedback: {self.company.name} → {self.student.full_name}"

    @property
    def average_score(self):
        scores = [
            self.technical_score, self.communication_score,
            self.teamwork_score, self.problem_solving_score, self.attitude_score
        ]
        return round(sum(scores) / len(scores), 1)

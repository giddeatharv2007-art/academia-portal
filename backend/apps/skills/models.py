"""
Skills Models - Skill master list, student skills, company requirements, badges
"""
import uuid
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Skill(models.Model):
    class Category(models.TextChoices):
        TECHNICAL = 'technical', 'Technical'
        SOFT = 'soft', 'Soft Skill'
        LANGUAGE = 'language', 'Programming Language'
        FRAMEWORK = 'framework', 'Framework/Library'
        DATABASE = 'database', 'Database'
        TOOL = 'tool', 'Tool'
        CLOUD = 'cloud', 'Cloud'
        AI_ML = 'ai_ml', 'AI/ML'
        OTHER = 'other', 'Other'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True, db_index=True)
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.OTHER)
    description = models.TextField(blank=True)
    icon = models.CharField(max_length=50, blank=True)  # emoji or icon class
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'skills'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.name} ({self.category})"


class StudentSkill(models.Model):
    class EvidenceType(models.TextChoices):
        SELF_DECLARED = 'self', 'Self Declared'
        ASSESSMENT = 'assessment', 'Assessment'
        PROJECT = 'project', 'Project'
        CERTIFICATION = 'certification', 'Certification'
        INTERNSHIP = 'internship', 'Internship'
        COLLEGE = 'college', 'College Verified'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.StudentProfile',
        on_delete=models.CASCADE,
        related_name='student_skills'
    )
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='student_skills')
    proficiency = models.PositiveIntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    is_verified = models.BooleanField(default=False)
    evidence_types = models.JSONField(default=list)  # list of EvidenceType values
    verification_source = models.CharField(max_length=100, blank=True)

    verified_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='verified_skills'
    )
    verified_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_skills'
        unique_together = ('student', 'skill')

    def __str__(self):
        return f"{self.student.full_name} - {self.skill.name} ({self.proficiency}%)"


class Badge(models.Model):
    class Category(models.TextChoices):
        SKILL = 'skill', 'Skill'
        ACHIEVEMENT = 'achievement', 'Achievement'
        INDUSTRY = 'industry', 'Industry Ready'
        COMMUNICATION = 'communication', 'Communication'
        PROJECT = 'project', 'Project'
        ASSESSMENT = 'assessment', 'Assessment'
        INTERNSHIP = 'internship', 'Internship'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    icon = models.CharField(max_length=10, default='🏅')  # emoji
    category = models.CharField(max_length=20, choices=Category.choices)
    requirements = models.JSONField(default=list)  # list of requirement strings
    points = models.PositiveIntegerField(default=10)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'badges'
        ordering = ['category', 'name']

    def __str__(self):
        return f"{self.icon} {self.name}"


class StudentBadge(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.StudentProfile',
        on_delete=models.CASCADE,
        related_name='student_badges'
    )
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='student_badges')
    earned_at = models.DateTimeField(auto_now_add=True)
    verification_source = models.CharField(max_length=200, blank=True)
    awarded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='awarded_badges'
    )

    class Meta:
        db_table = 'student_badges'
        unique_together = ('student', 'badge')

    def __str__(self):
        return f"{self.student.full_name} earned {self.badge.name}"

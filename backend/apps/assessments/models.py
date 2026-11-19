"""
Assessments Models
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class Assessment(models.Model):
    class Difficulty(models.TextChoices):
        BEGINNER = 'beginner', 'Beginner'
        INTERMEDIATE = 'intermediate', 'Intermediate'
        ADVANCED = 'advanced', 'Advanced'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    skill = models.ForeignKey(
        'skills.Skill', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='assessments'
    )
    difficulty = models.CharField(max_length=20, choices=Difficulty.choices, default=Difficulty.INTERMEDIATE)
    total_questions = models.PositiveIntegerField(default=10)
    time_limit_minutes = models.PositiveIntegerField(default=20)
    passing_score = models.PositiveIntegerField(default=60)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assessments'
        ordering = ['skill__name', 'difficulty']

    def __str__(self):
        return f"{self.title} ({self.difficulty})"


class AssessmentQuestion(models.Model):
    class QuestionType(models.TextChoices):
        MCQ = 'mcq', 'Multiple Choice'
        TRUE_FALSE = 'true_false', 'True/False'
        SHORT = 'short', 'Short Answer'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=20, choices=QuestionType.choices, default=QuestionType.MCQ)
    options = models.JSONField(default=list)  # ['Option A', 'Option B', ...]
    correct_answer = models.CharField(max_length=500)
    explanation = models.TextField(blank=True)
    difficulty = models.CharField(max_length=20, default='intermediate')
    points = models.PositiveIntegerField(default=1)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'assessment_questions'
        ordering = ['order']

    def __str__(self):
        return f"{self.assessment.title} - Q{self.order}"


class AssessmentResult(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.StudentProfile',
        on_delete=models.CASCADE,
        related_name='assessment_results'
    )
    assessment = models.ForeignKey(Assessment, on_delete=models.CASCADE, related_name='results')
    score = models.FloatField()  # percentage 0-100
    total_correct = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveIntegerField(default=0)
    answers = models.JSONField(default=dict)  # {question_id: answer}
    time_taken_minutes = models.FloatField(null=True, blank=True)
    passed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'assessment_results'
        ordering = ['-completed_at']

    def __str__(self):
        return f"{self.student.full_name} - {self.assessment.title}: {self.score}%"

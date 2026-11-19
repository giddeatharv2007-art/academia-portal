"""
AI Interview Models
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


class AIInterview(models.Model):
    class InterviewType(models.TextChoices):
        JOB = 'job', 'Job Interview'
        INTERNSHIP = 'internship', 'Internship Interview'
        PRACTICE = 'practice', 'Practice Interview'

    class Status(models.TextChoices):
        STARTED = 'started', 'Started'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        EVALUATED = 'evaluated', 'Evaluated'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey(
        'students.StudentProfile',
        on_delete=models.CASCADE,
        related_name='ai_interviews'
    )
    interview_type = models.CharField(max_length=20, choices=InterviewType.choices)
    target_role = models.CharField(max_length=200)
    job = models.ForeignKey(
        'jobs.Job', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='interviews'
    )
    internship = models.ForeignKey(
        'jobs.Internship', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='interviews'
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.STARTED)

    # Scores (0-100)
    technical_score = models.FloatField(null=True, blank=True)
    communication_score = models.FloatField(null=True, blank=True)
    problem_solving_score = models.FloatField(null=True, blank=True)
    answer_relevance_score = models.FloatField(null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    overall_score = models.FloatField(null=True, blank=True)

    strengths = models.JSONField(default=list)
    improvements = models.JSONField(default=list)
    evaluation_summary = models.TextField(blank=True)

    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'ai_interviews'
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.full_name} - {self.target_role} Interview"

    @property
    def duration_minutes(self):
        if self.completed_at and self.started_at:
            return round((self.completed_at - self.started_at).total_seconds() / 60, 1)
        return None


class InterviewQuestion(models.Model):
    class QuestionType(models.TextChoices):
        TECHNICAL = 'technical', 'Technical'
        HR = 'hr', 'HR'
        PROBLEM_SOLVING = 'problem_solving', 'Problem Solving'
        COMMUNICATION = 'communication', 'Communication'
        BEHAVIORAL = 'behavioral', 'Behavioral'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    interview = models.ForeignKey(AIInterview, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=30, choices=QuestionType.choices)
    order = models.PositiveIntegerField(default=0)
    expected_topics = models.JSONField(default=list)  # keywords to look for in answer

    class Meta:
        db_table = 'interview_questions'
        ordering = ['order']

    def __str__(self):
        return f"Q{self.order}: {self.question_text[:60]}..."


class InterviewAnswer(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    question = models.OneToOneField(
        InterviewQuestion, on_delete=models.CASCADE, related_name='answer'
    )
    transcript = models.TextField(blank=True)  # Speech-to-text result
    duration_seconds = models.FloatField(null=True, blank=True)

    # AI Evaluation
    relevance_score = models.FloatField(null=True, blank=True)
    technical_accuracy = models.FloatField(null=True, blank=True)
    communication_clarity = models.FloatField(null=True, blank=True)
    feedback = models.TextField(blank=True)

    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'interview_answers'

    def __str__(self):
        return f"Answer to Q{self.question.order}"

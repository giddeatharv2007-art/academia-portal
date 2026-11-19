"""
Industry Challenges Models
"""
import uuid
from django.db import models


class IndustryChallenge(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        ACTIVE = 'active', 'Active'
        EVALUATION = 'evaluation', 'Under Evaluation'
        CLOSED = 'closed', 'Closed'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    company = models.ForeignKey(
        'companies.CompanyProfile',
        on_delete=models.CASCADE,
        related_name='challenges'
    )
    title = models.CharField(max_length=200)
    description = models.TextField()
    problem_statement = models.TextField()
    required_skills = models.ManyToManyField('skills.Skill', related_name='challenges', blank=True)
    deadline = models.DateField()
    team_size_min = models.PositiveIntegerField(default=1)
    team_size_max = models.PositiveIntegerField(default=4)
    submission_requirements = models.TextField()
    prize_description = models.TextField(blank=True)
    possible_outcome = models.CharField(
        max_length=200, blank=True,
        help_text="e.g. Internship opportunity, Job offer"
    )
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'industry_challenges'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.company.name} - {self.title}"


class ChallengeTeam(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    challenge = models.ForeignKey(IndustryChallenge, on_delete=models.CASCADE, related_name='teams')
    name = models.CharField(max_length=100)
    leader = models.ForeignKey(
        'students.StudentProfile',
        on_delete=models.CASCADE,
        related_name='led_teams'
    )
    members = models.ManyToManyField(
        'students.StudentProfile',
        through='ChallengeTeamMember',
        related_name='challenge_teams'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'challenge_teams'

    def __str__(self):
        return f"{self.challenge.title} - Team: {self.name}"


class ChallengeTeamMember(models.Model):
    team = models.ForeignKey(ChallengeTeam, on_delete=models.CASCADE)
    student = models.ForeignKey('students.StudentProfile', on_delete=models.CASCADE)
    role = models.CharField(max_length=100, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'challenge_team_members'
        unique_together = ('team', 'student')


class ChallengeSubmission(models.Model):
    class Status(models.TextChoices):
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        SHORTLISTED = 'shortlisted', 'Shortlisted'
        WINNER = 'winner', 'Winner'
        NOT_SELECTED = 'not_selected', 'Not Selected'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    challenge = models.ForeignKey(IndustryChallenge, on_delete=models.CASCADE, related_name='submissions')
    team = models.OneToOneField(ChallengeTeam, on_delete=models.CASCADE, related_name='submission')
    github_url = models.URLField()
    demo_url = models.URLField(blank=True)
    presentation_url = models.URLField(blank=True)
    description = models.TextField()
    tech_stack = models.JSONField(default=list)

    # Evaluation
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SUBMITTED)
    score = models.FloatField(null=True, blank=True)
    evaluation_notes = models.TextField(blank=True)
    evaluated_by = models.ForeignKey(
        'companies.CompanyProfile', null=True, blank=True,
        on_delete=models.SET_NULL,
        related_name='evaluated_submissions'
    )
    evaluated_at = models.DateTimeField(null=True, blank=True)

    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'challenge_submissions'

    def __str__(self):
        return f"{self.challenge.title} - {self.team.name}"

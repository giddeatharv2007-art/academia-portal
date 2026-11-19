"""
Notifications Model
"""
import uuid
from django.db import models
from django.conf import settings


class Notification(models.Model):
    class NotifType(models.TextChoices):
        MATCH = 'match', 'New Match'
        APPLICATION = 'application', 'Application Update'
        SHORTLIST = 'shortlist', 'Shortlisted'
        INTERVIEW = 'interview', 'Interview Invitation'
        BADGE = 'badge', 'Badge Earned'
        SKILL_GAP = 'skill_gap', 'Skill Gap Alert'
        CHALLENGE = 'challenge', 'Industry Challenge'
        COMPANY = 'company', 'Company Update'
        TRAINING = 'training', 'Training Program'
        GENERAL = 'general', 'General'
        REJECTION = 'rejection', 'Rejection Feedback'

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    notif_type = models.CharField(max_length=20, choices=NotifType.choices, default=NotifType.GENERAL)
    is_read = models.BooleanField(default=False)
    related_id = models.CharField(max_length=36, blank=True)  # UUID of related object
    related_type = models.CharField(max_length=50, blank=True)  # e.g. "job", "application"
    action_url = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'is_read']),
        ]

    def __str__(self):
        return f"{self.user.email} - {self.title}"


def create_notification(user, title, message, notif_type='general', related_id='', related_type='', action_url=''):
    """Helper to create a notification."""
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        notif_type=notif_type,
        related_id=str(related_id),
        related_type=related_type,
        action_url=action_url,
    )

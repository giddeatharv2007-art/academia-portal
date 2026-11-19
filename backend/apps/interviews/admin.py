from django.contrib import admin
from .models import AIInterview, InterviewQuestion, InterviewAnswer

@admin.register(AIInterview)
class AIInterviewAdmin(admin.ModelAdmin):
    list_display = ['student', 'target_role', 'interview_type', 'status', 'overall_score', 'started_at']
    list_filter = ['status', 'interview_type']

admin.site.register(InterviewQuestion)
admin.site.register(InterviewAnswer)

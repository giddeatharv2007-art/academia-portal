from django.contrib import admin
from .models import IndustryChallenge, ChallengeTeam, ChallengeSubmission

@admin.register(IndustryChallenge)
class ChallengeAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'status', 'deadline', 'created_at']
    list_filter = ['status']

admin.site.register(ChallengeTeam)
admin.site.register(ChallengeSubmission)

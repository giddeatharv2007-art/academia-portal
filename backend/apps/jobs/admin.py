from django.contrib import admin
from .models import Job, Internship, Application, CompanyFeedback

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'job_type', 'work_mode', 'is_active', 'created_at']
    list_filter = ['is_active', 'job_type', 'work_mode']
    search_fields = ['title', 'company__name']

@admin.register(Internship)
class InternshipAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'duration_months', 'stipend_min', 'is_active']
    list_filter = ['is_active', 'work_mode']

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['student', 'status', 'applied_at', 'match_score']
    list_filter = ['status']

admin.site.register(CompanyFeedback)

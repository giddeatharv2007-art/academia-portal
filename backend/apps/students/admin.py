from django.contrib import admin
from .models import StudentProfile, EducationCertificate, Project, Certification, InternshipExperience

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'college_name', 'degree', 'graduation_year', 'job_readiness_score']
    search_fields = ['full_name', 'college_name', 'user__email']
    list_filter = ['current_status', 'degree', 'is_education_verified']

@admin.register(EducationCertificate)
class EducationCertAdmin(admin.ModelAdmin):
    list_display = ['student', 'degree', 'institution', 'status']
    list_filter = ['status']

admin.site.register(Project)
admin.site.register(Certification)
admin.site.register(InternshipExperience)

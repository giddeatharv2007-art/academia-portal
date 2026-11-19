from django.contrib import admin
from .models import CompanyProfile, CompanyRequiredSkill, CompanyVerification

@admin.register(CompanyProfile)
class CompanyProfileAdmin(admin.ModelAdmin):
    list_display = ['name', 'domain', 'verification_status', 'is_verified', 'created_at']
    list_filter = ['verification_status', 'is_verified', 'domain']
    search_fields = ['name', 'user__email']
    actions = ['approve_selected']

    def approve_selected(self, request, queryset):
        from django.utils import timezone
        queryset.update(is_verified=True, verification_status='approved', verified_at=timezone.now())
    approve_selected.short_description = 'Approve selected companies'

admin.site.register(CompanyRequiredSkill)
admin.site.register(CompanyVerification)

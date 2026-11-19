from django.contrib import admin
from .models import Skill, StudentSkill, Badge, StudentBadge

@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active']
    list_filter = ['category', 'is_active']
    search_fields = ['name']

@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ['student', 'skill', 'proficiency', 'is_verified']
    list_filter = ['is_verified', 'skill__category']
    search_fields = ['student__full_name', 'skill__name']

@admin.register(Badge)
class BadgeAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'category', 'points', 'is_active']
    list_filter = ['category', 'is_active']

@admin.register(StudentBadge)
class StudentBadgeAdmin(admin.ModelAdmin):
    list_display = ['student', 'badge', 'earned_at']

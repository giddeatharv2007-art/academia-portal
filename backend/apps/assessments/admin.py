from django.contrib import admin
from .models import Assessment, AssessmentQuestion, AssessmentResult

@admin.register(Assessment)
class AssessmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'skill', 'difficulty', 'total_questions', 'passing_score', 'is_active']
    list_filter = ['difficulty', 'is_active']

@admin.register(AssessmentQuestion)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['assessment', 'order', 'question_type', 'difficulty']
    list_filter = ['question_type', 'difficulty']

@admin.register(AssessmentResult)
class ResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'assessment', 'score', 'passed', 'completed_at']
    list_filter = ['passed']

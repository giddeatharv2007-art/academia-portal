from django.urls import path
from . import views

urlpatterns = [
    path('jobs/', views.match_jobs, name='match-jobs'),
    path('internships/', views.match_internships, name='match-internships'),
    path('jobs/<uuid:job_id>/', views.match_for_job, name='match-job'),
    path('internships/<uuid:internship_id>/', views.match_for_internship, name='match-internship'),
    path('skill-gap/', views.skill_gap_analysis, name='skill-gap'),
    path('roadmap/', views.learning_roadmap, name='learning-roadmap'),
    path('students/', views.find_students_for_company, name='find-students'),
    path('rejection-analysis/', views.rejection_analysis, name='rejection-analysis'),
    path('recommended-companies/', views.recommended_companies, name='recommended-companies'),
]

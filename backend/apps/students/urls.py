from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('education-certificates', views.EducationCertificateViewSet, basename='education-cert')
router.register('projects', views.ProjectViewSet, basename='project')
router.register('certifications', views.CertificationViewSet, basename='certification')
router.register('internship-experiences', views.InternshipExperienceViewSet, basename='internship-exp')

urlpatterns = [
    path('profile/', views.StudentProfileView.as_view(), name='student-profile'),
    path('profile/<uuid:student_id>/', views.student_public_profile, name='student-public-profile'),
    path('dashboard/', views.student_dashboard_stats, name='student-dashboard'),
    path('admin/all/', views.admin_list_students, name='admin-students-list'),
    path('', include(router.urls)),
]

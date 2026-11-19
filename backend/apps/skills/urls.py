from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('admin', views.SkillViewSet, basename='skill-admin')
router.register('student', views.StudentSkillViewSet, basename='student-skill')
router.register('badges', views.BadgeViewSet, basename='badge')

urlpatterns = [
    path('list/', views.SkillListView.as_view(), name='skill-list'),
    path('passport/', views.skill_passport, name='my-passport'),
    path('passport/<uuid:student_id>/', views.skill_passport, name='student-passport'),
    path('my-badges/', views.student_badges, name='my-badges'),
    path('award-badge/', views.award_badge, name='award-badge'),
    path('', include(router.urls)),
]

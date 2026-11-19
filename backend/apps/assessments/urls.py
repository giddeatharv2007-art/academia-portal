from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('list', views.AssessmentViewSet, basename='assessment')

urlpatterns = [
    path('<uuid:assessment_id>/questions/', views.assessment_questions, name='assessment-questions'),
    path('submit/', views.submit_assessment, name='submit-assessment'),
    path('my-results/', views.my_results, name='my-results'),
    path('', include(router.urls)),
]

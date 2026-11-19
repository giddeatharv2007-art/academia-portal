from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('', views.IndustryChallengeViewSet, basename='challenge')

urlpatterns = [
    path('submissions/<uuid:submission_id>/evaluate/', views.evaluate_submission, name='evaluate-submission'),
    path('', include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('jobs', views.JobViewSet, basename='job')
router.register('internships', views.InternshipViewSet, basename='internship')
router.register('applications', views.ApplicationViewSet, basename='application')

urlpatterns = [
    path('', include(router.urls)),
]

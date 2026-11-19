from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('training', views.TrainingProgramViewSet, basename='training-program')

urlpatterns = [
    # Profile & dashboard
    path('profile/',                              views.CollegeProfileView.as_view(), name='college-profile'),
    path('dashboard/',                            views.college_dashboard,            name='college-dashboard'),

    # Students management
    path('students/',                             views.college_students_list,        name='college-students-list'),
    path('students/add/',                         views.college_add_student,          name='college-add-student'),
    path('students/<uuid:student_id>/suggest/',   views.college_send_suggestion,      name='college-send-suggestion'),

    # Bulk notifications
    path('notifications/send/',                   views.college_send_notification,    name='college-send-notification'),

    # Training (ViewSet)
    path('', include(router.urls)),
]

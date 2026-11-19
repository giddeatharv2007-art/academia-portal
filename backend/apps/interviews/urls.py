from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.start_interview, name='interview-start'),
    path('answer/', views.submit_answer, name='interview-answer'),
    path('complete/', views.complete_interview, name='interview-complete'),
    path('my/', views.my_interviews, name='my-interviews'),
    path('result/<uuid:interview_id>/', views.interview_result, name='interview-result'),
]

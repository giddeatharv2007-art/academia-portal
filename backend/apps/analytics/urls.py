from django.urls import path
from . import views

urlpatterns = [
    path('industry-demand/', views.industry_skill_demand, name='industry-demand'),
    path('college/', views.college_analytics, name='college-analytics'),
    path('admin/', views.admin_dashboard_analytics, name='admin-analytics'),
]

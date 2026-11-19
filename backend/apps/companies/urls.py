from django.urls import path
from . import views

urlpatterns = [
    path('profile/', views.CompanyProfileView.as_view(), name='company-profile'),
    path('profile/<uuid:company_id>/', views.company_public_profile, name='company-public'),
    path('list/', views.company_list, name='company-list'),
    path('dashboard/', views.company_dashboard, name='company-dashboard'),
    # Admin
    path('admin/pending/', views.pending_companies, name='pending-companies'),
    path('admin/all/', views.all_companies, name='all-companies'),
    path('admin/<uuid:company_id>/approve/', views.approve_company, name='approve-company'),
    path('admin/<uuid:company_id>/reject/', views.reject_company, name='reject-company'),
]

"""
Accounts URLs
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views

urlpatterns = [
    # Registration
    path('register/student/', views.register_student, name='register-student'),
    path('register/company/', views.register_company, name='register-company'),
    path('register/college/', views.register_college, name='register-college'),
    path('register/advisor/', views.register_advisor, name='register-advisor'),

    # Email / OTP verification
    path('verify-email/', views.verify_email, name='verify-email'),
    path('resend-verification/', views.resend_verification_email, name='resend-verification'),
    path('send-otp/', views.send_otp, name='send-otp'),
    path('verify-otp/', views.verify_otp, name='verify-otp'),

    # JWT Auth
    path('login/', views.CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', views.logout, name='logout'),

    # Profile
    path('me/', views.get_me, name='me'),
    path('change-password/', views.change_password, name='change-password'),
]

"""
Academia Portal - Root URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # Django Admin
    path('django-admin/', admin.site.urls),

    # Application APIs
    path('api/auth/', include('apps.accounts.urls')),
    path('api/students/', include('apps.students.urls')),
    path('api/companies/', include('apps.companies.urls')),
    path('api/colleges/', include('apps.colleges.urls')),
    path('api/jobs/', include('apps.jobs.urls')),
    path('api/skills/', include('apps.skills.urls')),
    path('api/matching/', include('apps.matching.urls')),
    path('api/assessments/', include('apps.assessments.urls')),
    path('api/interviews/', include('apps.interviews.urls')),
    path('api/challenges/', include('apps.challenges.urls')),
    path('api/analytics/', include('apps.analytics.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/badges/', include('apps.badges.urls')),
]

# Try to add drf-spectacular docs if installed
try:
    from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
    urlpatterns += [
        path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
        path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
        path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
    ]
except ImportError:
    pass

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

from django.urls import path
from . import views

urlpatterns = [
    path('', views.my_notifications, name='notifications'),
    path('unread-count/', views.unread_count, name='unread-count'),
    path('mark-read/', views.mark_read, name='mark-read'),
    path('clear/', views.clear_notifications, name='clear-notifications'),
]

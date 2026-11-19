from django.urls import path
from . import views

urlpatterns = [
    path('', views.badge_list, name='badge-list'),
    path('my/', views.my_badges, name='my-badges'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('questions/', views.get_questions, name='psych-questions'),
    path('submit/', views.submit_test, name='psych-submit'),
    path('profile/', views.get_profile, name='psych-profile'),
    path('recommendations/', views.get_recommendations, name='psych-recommendations'),
]

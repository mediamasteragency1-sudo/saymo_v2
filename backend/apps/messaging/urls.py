from django.urls import path
from . import views

urlpatterns = [
    path('', views.conversations_list, name='conversations-list'),
    path('unread/', views.unread_count, name='messages-unread'),
    path('<int:booking_id>/', views.thread, name='message-thread'),
]

from django.urls import path
from . import views

urlpatterns = [
    path('', views.bookings_list, name='bookings-list'),
    path('host/', views.host_bookings_list, name='host-bookings-list'),
    path('<int:pk>/', views.booking_detail, name='booking-detail'),
    path('<int:pk>/status/', views.update_booking_status, name='booking-status'),
]

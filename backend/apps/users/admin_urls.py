from django.urls import path
from . import admin_views
from apps.properties.admin_views import (
    admin_properties_list, admin_property_detail, admin_moderate_property
)
from apps.bookings.admin_views import admin_bookings_list, admin_booking_detail
from apps.reviews.admin_views import admin_review_delete
from apps.reports.views import admin_reports_list, admin_report_resolve

urlpatterns = [
    path('users/', admin_views.admin_users_list, name='admin-users'),
    path('users/<int:pk>/', admin_views.admin_user_detail, name='admin-user-detail'),
    path('properties/', admin_properties_list, name='admin-properties'),
    path('properties/<int:pk>/', admin_property_detail, name='admin-property-detail'),
    path('properties/<int:pk>/moderate/', admin_moderate_property, name='admin-moderate-property'),
    path('bookings/', admin_bookings_list, name='admin-bookings'),
    path('bookings/<int:pk>/', admin_booking_detail, name='admin-booking-detail'),
    path('reviews/<int:pk>/', admin_review_delete, name='admin-review-delete'),
    path('analytics/', admin_views.admin_analytics, name='admin-analytics'),
    path('reports/', admin_reports_list, name='admin-reports'),
    path('reports/<int:pk>/resolve/', admin_report_resolve, name='admin-report-resolve'),
]

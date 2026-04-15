from django.urls import path
from . import views

urlpatterns = [
    path('', views.properties_list, name='properties-list'),
    path('<int:pk>/', views.property_detail, name='property-detail'),
    path('<int:pk>/images/', views.upload_property_image, name='property-images'),
    path('<int:pk>/availability/', views.property_availability, name='property-availability'),
    path('<int:pk>/availability/range/', views.availability_range, name='property-availability-range'),
    path('amenities/', views.amenities_list, name='amenities-list'),
    path('host/mine/', views.host_properties, name='host-properties'),
]

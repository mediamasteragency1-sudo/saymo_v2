import django_filters
from django.db.models import Avg
from .models import Property


class PropertyFilter(django_filters.FilterSet):
    city = django_filters.CharFilter(lookup_expr='icontains')
    property_type = django_filters.CharFilter()
    min_price = django_filters.NumberFilter(field_name='price_per_night', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price_per_night', lookup_expr='lte')
    min_guests = django_filters.NumberFilter(field_name='max_guests', lookup_expr='gte')
    amenities = django_filters.BaseInFilter(field_name='amenities__id')

    class Meta:
        model = Property
        fields = ['city', 'property_type', 'min_price', 'max_price', 'min_guests', 'amenities']

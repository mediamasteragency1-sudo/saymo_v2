from rest_framework import status, generics, filters
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from datetime import date, timedelta

from .models import Property, PropertyImage, Amenity, Availability
from .serializers import (
    PropertyListSerializer, PropertyDetailSerializer,
    PropertyImageSerializer, AmenitySerializer, AvailabilitySerializer
)
from .filters import PropertyFilter
from apps.users.permissions import IsHost


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def properties_list(request):
    if request.method == 'GET':
        queryset = Property.objects.filter(
            is_active=True, moderation_status='approved'
        ).prefetch_related('images', 'amenities')

        # Filters
        city = request.query_params.get('city')
        property_type = request.query_params.get('type')
        min_price = request.query_params.get('min_price')
        max_price = request.query_params.get('max_price')
        min_guests = request.query_params.get('guests')
        amenity_ids = request.query_params.getlist('amenities')
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        search = request.query_params.get('search')

        if city:
            queryset = queryset.filter(city__icontains=city)
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        if min_price:
            queryset = queryset.filter(price_per_night__gte=min_price)
        if max_price:
            queryset = queryset.filter(price_per_night__lte=max_price)
        if min_guests:
            queryset = queryset.filter(max_guests__gte=min_guests)
        if amenity_ids:
            for aid in amenity_ids:
                queryset = queryset.filter(amenities__id=aid)
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(city__icontains=search)
            )
        if start_date and end_date:
            booked_ids = Property.objects.filter(
                bookings__start_date__lt=end_date,
                bookings__end_date__gt=start_date,
                bookings__status__in=['pending', 'confirmed']
            ).values_list('id', flat=True)
            queryset = queryset.exclude(id__in=booked_ids)

        queryset = queryset.distinct()
        serializer = PropertyListSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    # POST — create property (host only)
    if request.user.role not in ['host', 'admin']:
        return Response({'error': 'Seuls les hôtes peuvent créer des logements.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = PropertyDetailSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(host=request.user, moderation_status='pending', is_active=False)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticatedOrReadOnly])
def property_detail(request, pk):
    try:
        property = Property.objects.prefetch_related('images', 'amenities').get(pk=pk)
    except Property.DoesNotExist:
        return Response({'error': 'Logement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = PropertyDetailSerializer(property, context={'request': request})
        return Response(serializer.data)

    if property.host != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'PUT':
        serializer = PropertyDetailSerializer(property, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    property.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
def upload_property_image(request, pk):
    try:
        property = Property.objects.get(pk=pk)
    except Property.DoesNotExist:
        return Response({'error': 'Logement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if property.host != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

    image = request.FILES.get('image')
    if not image:
        return Response({'error': 'Image requise.'}, status=status.HTTP_400_BAD_REQUEST)

    is_primary = request.data.get('is_primary', 'false').lower() == 'true'
    if is_primary:
        property.images.filter(is_primary=True).update(is_primary=False)

    prop_image = PropertyImage.objects.create(property=property, image=image, is_primary=is_primary)
    return Response(PropertyImageSerializer(prop_image, context={'request': request}).data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticatedOrReadOnly])
def property_availability(request, pk):
    try:
        property = Property.objects.get(pk=pk)
    except Property.DoesNotExist:
        return Response({'error': 'Logement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        availabilities = Availability.objects.filter(property=property)
        serializer = AvailabilitySerializer(availabilities, many=True)
        return Response(serializer.data)

    if property.host != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = AvailabilitySerializer(data=request.data, many=True)
    if serializer.is_valid():
        for item in serializer.validated_data:
            Availability.objects.update_or_create(
                property=property, date=item['date'],
                defaults={'is_available': item['is_available']}
            )
        return Response({'message': 'Disponibilités mises à jour.'})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def availability_range(request, pk):
    """Bulk set availability for a date range."""
    try:
        prop = Property.objects.get(pk=pk)
    except Property.DoesNotExist:
        return Response({'error': 'Logement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if prop.host != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission refusee.'}, status=status.HTTP_403_FORBIDDEN)

    start = request.data.get('start_date')
    end = request.data.get('end_date')
    is_available = request.data.get('is_available', True)

    if not start or not end:
        return Response({'error': 'start_date et end_date requis.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        start_dt = date.fromisoformat(start)
        end_dt = date.fromisoformat(end)
    except ValueError:
        return Response({'error': 'Format de date invalide (YYYY-MM-DD).'}, status=status.HTTP_400_BAD_REQUEST)

    if end_dt <= start_dt:
        return Response({'error': 'end_date doit etre apres start_date.'}, status=status.HTTP_400_BAD_REQUEST)

    delta = (end_dt - start_dt).days
    for i in range(delta):
        d = start_dt + timedelta(days=i)
        Availability.objects.update_or_create(
            property=prop, date=d,
            defaults={'is_available': is_available}
        )

    return Response({'message': f'{delta} dates mises a jour.', 'is_available': is_available})


@api_view(['GET'])
@permission_classes([AllowAny])
def amenities_list(request):
    amenities = Amenity.objects.all()
    serializer = AmenitySerializer(amenities, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def host_properties(request):
    properties = Property.objects.filter(host=request.user).prefetch_related('images', 'amenities')
    serializer = PropertyListSerializer(properties, many=True, context={'request': request})
    return Response(serializer.data)

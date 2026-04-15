from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from datetime import timedelta
from .models import Booking
from .serializers import BookingSerializer, BookingCreateSerializer
from apps.notifications.utils import create_notification
from apps.messaging.models import Message
from apps.properties.models import Availability


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def bookings_list(request):
    if request.method == 'GET':
        # Always return the current user's own bookings as a traveler
        bookings = Booking.objects.filter(
            user=request.user
        ).select_related('property').order_by('-created_at')

        serializer = BookingSerializer(bookings, many=True, context={'request': request})
        return Response(serializer.data)

    serializer = BookingCreateSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        booking = serializer.save(user=request.user)

        # Auto-update completed bookings
        _update_completed_bookings()

        # Si le voyageur a écrit un message lors de la réservation,
        # le créer comme premier message du thread de messagerie
        if booking.message and booking.message.strip():
            Message.objects.create(
                booking=booking,
                sender=request.user,
                content=booking.message.strip(),
            )

        # Notifications
        create_notification(
            user=request.user,
            message=f'Votre réservation pour "{booking.property.title}" est en attente de confirmation.',
            notif_type='booking',
        )
        create_notification(
            user=booking.property.host,
            message=f'Nouvelle réservation pour "{booking.property.title}" du {booking.start_date} au {booking.end_date}.',
            notif_type='booking',
        )

        return Response(BookingSerializer(booking, context={'request': request}).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def booking_detail(request, pk):
    try:
        booking = Booking.objects.select_related('user', 'property').get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'error': 'Réservation introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if booking.user != request.user and booking.property.host != request.user and request.user.role != 'admin':
        return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = BookingSerializer(booking, context={'request': request})
    return Response(serializer.data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_booking_status(request, pk):
    try:
        booking = Booking.objects.select_related('user', 'property').get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'error': 'Réservation introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('status')
    user = request.user

    # Permission checks
    if new_status == 'cancelled':
        if booking.user != user and booking.property.host != user and user.role != 'admin':
            return Response({'error': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)
    elif new_status in ['confirmed', 'completed']:
        if booking.property.host != user and user.role != 'admin':
            return Response({'error': 'Seul l\'hôte peut confirmer une réservation.'}, status=status.HTTP_403_FORBIDDEN)
    else:
        return Response({'error': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    if booking.status in ['cancelled', 'completed']:
        return Response({'error': 'Cette réservation ne peut plus être modifiée.'}, status=status.HTTP_400_BAD_REQUEST)

    old_status = booking.status
    booking.status = new_status
    booking.save()

    # Sync availability calendar
    if new_status == 'confirmed':
        _block_booking_dates(booking, is_available=False)
    elif new_status == 'cancelled' and old_status == 'confirmed':
        _block_booking_dates(booking, is_available=True)

    # Notifications
    status_labels = {'confirmed': 'confirmée', 'cancelled': 'annulée', 'completed': 'terminée'}
    label = status_labels.get(new_status, new_status)

    create_notification(
        user=booking.user,
        message=f'Votre réservation pour "{booking.property.title}" a été {label}.',
        notif_type='booking',
    )

    if new_status == 'cancelled' and booking.user != user:
        create_notification(
            user=booking.property.host,
            message=f'La réservation de {booking.user.name} pour "{booking.property.title}" a été annulée.',
            notif_type='booking',
        )

    return Response(BookingSerializer(booking, context={'request': request}).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def host_bookings_list(request):
    """Bookings made on the current user's properties (host view)."""
    bookings = Booking.objects.filter(
        property__host=request.user
    ).select_related('user', 'property').order_by('-created_at')
    serializer = BookingSerializer(bookings, many=True, context={'request': request})
    return Response(serializer.data)


def _block_booking_dates(booking, is_available):
    """Mark every date of a booking as available or unavailable in the calendar."""
    delta = (booking.end_date - booking.start_date).days
    for i in range(delta):
        d = booking.start_date + timedelta(days=i)
        Availability.objects.update_or_create(
            property=booking.property,
            date=d,
            defaults={'is_available': is_available},
        )


def _update_completed_bookings():
    today = timezone.now().date()
    Booking.objects.filter(
        status='confirmed',
        end_date__lt=today
    ).update(status='completed')

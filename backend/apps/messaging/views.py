from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q

from .models import Message
from .serializers import MessageSerializer
from apps.bookings.models import Booking
from apps.notifications.models import Notification


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def conversations_list(request):
    """All booking threads where current user is guest or host."""
    user = request.user
    bookings = (
        Booking.objects
        .filter(Q(user=user) | Q(property__host=user))
        .filter(messages__isnull=False)
        .distinct()
        .select_related('user', 'property__host', 'property')
    )

    result = []
    for booking in bookings:
        last_msg = Message.objects.filter(booking=booking).order_by('-created_at').first()
        unread = Message.objects.filter(
            booking=booking, is_read=False
        ).exclude(sender=user).count()
        other = booking.property.host if booking.user == user else booking.user
        result.append({
            'booking_id': booking.id,
            'property_title': booking.property.title,
            'other_user_name': other.name,
            'other_user_id': other.id,
            'last_message': last_msg.content[:80] if last_msg else '',
            'last_message_at': last_msg.created_at if last_msg else None,
            'unread_count': unread,
        })

    result.sort(key=lambda x: x['last_message_at'] or '', reverse=True)
    return Response(result)


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def thread(request, booking_id):
    """Get thread or send a message in a booking conversation."""
    user = request.user
    try:
        booking = Booking.objects.select_related(
            'user', 'property__host', 'property'
        ).get(pk=booking_id)
    except Booking.DoesNotExist:
        return Response({'error': 'Reservation introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if booking.user != user and booking.property.host != user:
        return Response({'error': 'Permission refusee.'}, status=status.HTTP_403_FORBIDDEN)

    if request.method == 'GET':
        Message.objects.filter(
            booking=booking, is_read=False
        ).exclude(sender=user).update(is_read=True)
        messages = Message.objects.filter(booking=booking).select_related('sender')
        other = booking.property.host if booking.user == user else booking.user
        return Response({
            'booking_id': booking.id,
            'property_title': booking.property.title,
            'other_user': {'id': other.id, 'name': other.name},
            'messages': MessageSerializer(messages, many=True).data,
        })

    # POST — send message
    content = request.data.get('content', '').strip()
    if not content:
        return Response({'error': 'Message vide.'}, status=status.HTTP_400_BAD_REQUEST)

    msg = Message.objects.create(booking=booking, sender=user, content=content)

    other = booking.property.host if booking.user == user else booking.user
    Notification.objects.create(
        user=other,
        message=f'Nouveau message de {user.name} concernant "{booking.property.title}"',
        type='system',
    )

    return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_count(request):
    user = request.user
    booking_ids = Booking.objects.filter(
        Q(user=user) | Q(property__host=user)
    ).values_list('id', flat=True)
    count = Message.objects.filter(
        booking_id__in=booking_ids, is_read=False
    ).exclude(sender=user).count()
    return Response({'unread': count})

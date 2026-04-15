from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Booking
from .serializers import BookingSerializer
from apps.users.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_bookings_list(request):
    bookings = Booking.objects.all().select_related('user', 'property').order_by('-created_at')
    serializer = BookingSerializer(bookings, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def admin_booking_detail(request, pk):
    try:
        booking = Booking.objects.get(pk=pk)
    except Booking.DoesNotExist:
        return Response({'error': 'Réservation introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    booking.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

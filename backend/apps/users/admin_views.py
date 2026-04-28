from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from .models import User
from .serializers import AdminUserSerializer
from .permissions import IsAdmin
from apps.properties.models import Property
from apps.bookings.models import Booking
from apps.reviews.models import Review


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_users_list(request):
    users = User.objects.all().order_by('-created_at')
    serializer = AdminUserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdmin])
def admin_user_detail(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'Utilisateur introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = AdminUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_analytics(request):
    now = timezone.now()
    thirty_days_ago = now - timedelta(days=30)

    total_users = User.objects.count()
    new_users = User.objects.filter(created_at__gte=thirty_days_ago).count()
    total_properties = Property.objects.count()
    active_properties = Property.objects.filter(is_active=True).count()
    total_bookings = Booking.objects.count()
    recent_bookings = Booking.objects.filter(created_at__gte=thirty_days_ago).count()
    total_revenue = Booking.objects.exclude(status='cancelled').aggregate(Sum('total_price'))['total_price__sum'] or 0

    bookings_by_month = []
    for i in range(6):
        month_start = now - timedelta(days=30 * (i + 1))
        month_end = now - timedelta(days=30 * i)
        count = Booking.objects.filter(
            created_at__gte=month_start,
            created_at__lt=month_end
        ).count()
        bookings_by_month.append({
            'month': month_start.strftime('%b %Y'),
            'count': count
        })

    return Response({
        'users': {'total': total_users, 'new_last_30_days': new_users},
        'properties': {'total': total_properties, 'active': active_properties},
        'bookings': {'total': total_bookings, 'recent': recent_bookings},
        'revenue': {'total': float(total_revenue)},
        'bookings_by_month': list(reversed(bookings_by_month)),
    })

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def notifications_list(request):
    notifications = Notification.objects.filter(user=request.user)
    serializer = NotificationSerializer(notifications, many=True)
    return Response({
        'notifications': serializer.data,
        'unread_count': notifications.filter(is_read=False).count(),
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_read(request, pk):
    try:
        notification = Notification.objects.get(pk=pk, user=request.user)
    except Notification.DoesNotExist:
        return Response({'error': 'Notification introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    notification.is_read = True
    notification.save()
    return Response(NotificationSerializer(notification).data)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def mark_all_read(request):
    Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({'message': 'Toutes les notifications ont été marquées comme lues.'})

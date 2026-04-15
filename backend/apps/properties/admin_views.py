from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Property
from .serializers import PropertyDetailSerializer, PropertyListSerializer
from apps.users.permissions import IsAdmin
from apps.notifications.models import Notification


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_properties_list(request):
    mod_status = request.query_params.get('moderation_status')
    queryset = Property.objects.all().prefetch_related('images', 'amenities').select_related('host')
    if mod_status:
        queryset = queryset.filter(moderation_status=mod_status)
    serializer = PropertyListSerializer(queryset, many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def admin_property_detail(request, pk):
    try:
        prop = Property.objects.get(pk=pk)
    except Property.DoesNotExist:
        return Response({'error': 'Logement introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    prop.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(['PATCH'])
@permission_classes([IsAdmin])
def admin_moderate_property(request, pk):
    """Approve or reject a pending property."""
    try:
        prop = Property.objects.select_related('host').get(pk=pk)
    except Property.DoesNotExist:
        return Response({'error': 'Logement introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    new_status = request.data.get('moderation_status')
    if new_status not in ['approved', 'rejected', 'pending']:
        return Response({'error': 'Statut invalide.'}, status=status.HTTP_400_BAD_REQUEST)

    prop.moderation_status = new_status
    if new_status == 'approved':
        prop.is_active = True
    elif new_status == 'rejected':
        prop.is_active = False
    prop.save()

    # Notify host
    label = 'approuve' if new_status == 'approved' else 'rejete'
    Notification.objects.create(
        user=prop.host,
        message=f'Votre logement "{prop.title}" a ete {label} par l\'administration.',
        type='system',
    )

    return Response({'id': prop.id, 'moderation_status': prop.moderation_status})

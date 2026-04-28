from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Review
from apps.users.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAdmin])
def admin_reviews_list(request):
    reviews = Review.objects.select_related('user', 'property').order_by('-created_at')
    data = [
        {
            'id': r.id,
            'user_name': r.user.name,
            'property_id': r.property.id,
            'property_title': r.property.title,
            'rating': r.rating,
            'comment': r.comment,
            'host_reply': r.host_reply,
            'created_at': r.created_at,
        }
        for r in reviews
    ]
    return Response(data)


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def admin_review_delete(request, pk):
    try:
        review = Review.objects.get(pk=pk)
    except Review.DoesNotExist:
        return Response({'error': 'Avis introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    review.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from .models import Review
from apps.users.permissions import IsAdmin


@api_view(['DELETE'])
@permission_classes([IsAdmin])
def admin_review_delete(request, pk):
    try:
        review = Review.objects.get(pk=pk)
    except Review.DoesNotExist:
        return Response({'error': 'Avis introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    review.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

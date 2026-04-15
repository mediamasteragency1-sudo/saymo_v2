from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response

from .models import Review
from .serializers import ReviewSerializer, HostReplySerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticatedOrReadOnly])
def reviews_list(request):
    if request.method == 'GET':
        queryset = Review.objects.select_related('user', 'property')
        property_id = request.query_params.get('property')
        user_id = request.query_params.get('user')

        if property_id:
            queryset = queryset.filter(property_id=property_id)
        if user_id:
            queryset = queryset.filter(user_id=user_id)

        queryset = queryset.order_by('-created_at')
        serializer = ReviewSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)

    serializer = ReviewSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def review_reply(request, pk):
    try:
        review = Review.objects.get(pk=pk)
    except Review.DoesNotExist:
        return Response({'error': 'Avis introuvable.'}, status=status.HTTP_404_NOT_FOUND)

    if review.property.host != request.user:
        return Response({'error': 'Seul l\'hôte peut répondre à un avis.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = HostReplySerializer(review, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(ReviewSerializer(review, context={'request': request}).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

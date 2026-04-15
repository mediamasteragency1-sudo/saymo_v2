from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Favorite
from .serializers import FavoriteSerializer


@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def favorites_list(request):
    if request.method == 'GET':
        favorites = Favorite.objects.filter(user=request.user).select_related('property')
        serializer = FavoriteSerializer(favorites, many=True, context={'request': request})
        return Response(serializer.data)

    serializer = FavoriteSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        try:
            favorite = serializer.save(user=request.user)
            return Response(FavoriteSerializer(favorite, context={'request': request}).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def favorite_delete(request, pk):
    try:
        favorite = Favorite.objects.get(pk=pk, user=request.user)
    except Favorite.DoesNotExist:
        return Response({'error': 'Favori introuvable.'}, status=status.HTTP_404_NOT_FOUND)
    favorite.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)

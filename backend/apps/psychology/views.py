from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from .models import PsychologicalTest, Recommendation
from .serializers import PsychTestSubmitSerializer, PsychTestSerializer, RecommendationSerializer
from .questions import QUESTIONS
from .algorithm import calculate_profile, generate_recommendations
from apps.notifications.utils import create_notification


@api_view(['GET'])
@permission_classes([AllowAny])
def get_questions(request):
    return Response({'questions': QUESTIONS})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_test(request):
    serializer = PsychTestSubmitSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    answers = serializer.validated_data['answers']
    profile_type = calculate_profile(answers)

    test, created = PsychologicalTest.objects.update_or_create(
        user=request.user,
        defaults={'answers': answers, 'profile_type': profile_type}
    )

    recommendations = generate_recommendations(request.user)

    # Notify user
    action = 'créé' if created else 'mis à jour'
    create_notification(
        user=request.user,
        message=f'Votre profil a été {action} : {test.get_profile_type_display()}. {len(recommendations)} recommandations générées.',
        notif_type='recommendation',
    )

    return Response({
        'profile': PsychTestSerializer(test).data,
        'recommendations_count': len(recommendations),
        'message': f'Profil "{test.get_profile_type_display()}" calculé avec succès.',
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    try:
        test = request.user.psychological_test
    except PsychologicalTest.DoesNotExist:
        return Response({'has_test': False, 'message': 'Aucun test effectué.'}, status=status.HTTP_404_NOT_FOUND)

    serializer = PsychTestSerializer(test)
    return Response({'has_test': True, **serializer.data})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    try:
        test = request.user.psychological_test
    except PsychologicalTest.DoesNotExist:
        return Response(
            {'error': 'Veuillez d\'abord passer le test psychologique.'},
            status=status.HTTP_404_NOT_FOUND
        )

    recommendations = Recommendation.objects.filter(
        user=request.user
    ).select_related('property').prefetch_related('property__images', 'property__amenities').order_by('-score')

    serializer = RecommendationSerializer(recommendations, many=True, context={'request': request})
    return Response({
        'profile': PsychTestSerializer(test).data,
        'recommendations': serializer.data,
    })

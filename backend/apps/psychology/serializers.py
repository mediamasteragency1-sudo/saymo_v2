from rest_framework import serializers
from .models import PsychologicalTest, Recommendation
from apps.properties.serializers import PropertyListSerializer


class PsychTestSubmitSerializer(serializers.Serializer):
    answers = serializers.DictField(
        child=serializers.CharField(max_length=1)
    )

    def validate_answers(self, answers):
        if len(answers) < 8:
            raise serializers.ValidationError('Veuillez répondre à au moins 8 questions.')
        return answers


class PsychTestSerializer(serializers.ModelSerializer):
    profile_label = serializers.CharField(source='get_profile_type_display', read_only=True)

    class Meta:
        model = PsychologicalTest
        fields = ['profile_type', 'profile_label', 'answers', 'updated_at']


class RecommendationSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)

    class Meta:
        model = Recommendation
        fields = ['id', 'property', 'score', 'created_at']

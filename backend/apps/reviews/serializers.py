from rest_framework import serializers
from .models import Review
from apps.bookings.models import Booking


class ReviewSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_avatar = serializers.SerializerMethodField()
    property_title = serializers.CharField(source='property.title', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'user_name', 'user_avatar', 'property', 'property_title',
            'booking', 'rating', 'comment', 'host_reply', 'created_at',
        ]
        read_only_fields = ['id', 'user_name', 'user_avatar', 'host_reply', 'created_at']

    def get_user_avatar(self, obj):
        request = self.context.get('request')
        if obj.user.avatar and request:
            return request.build_absolute_uri(obj.user.avatar.url)
        return None

    def validate(self, data):
        user = self.context['request'].user
        booking = data.get('booking')

        if not booking:
            raise serializers.ValidationError({'booking': 'Réservation requise.'})

        if booking.user != user:
            raise serializers.ValidationError({'booking': 'Cette réservation ne vous appartient pas.'})

        if booking.status != 'completed':
            raise serializers.ValidationError({'booking': 'Vous ne pouvez laisser un avis qu\'après un séjour terminé.'})

        if booking.property != data.get('property'):
            raise serializers.ValidationError({'property': 'Le logement ne correspond pas à la réservation.'})

        if Review.objects.filter(user=user, booking=booking).exists():
            raise serializers.ValidationError('Vous avez déjà laissé un avis pour ce séjour.')

        return data

    def create(self, validated_data):
        return Review.objects.create(**validated_data)


class HostReplySerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['host_reply']

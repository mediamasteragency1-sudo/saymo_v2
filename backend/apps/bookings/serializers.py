from rest_framework import serializers
from django.utils import timezone
from .models import Booking
from apps.properties.serializers import PropertyListSerializer


class BookingCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['property', 'start_date', 'end_date', 'guests', 'message']

    def validate(self, data):
        property = data['property']
        start_date = data['start_date']
        end_date = data['end_date']
        user = self.context['request'].user

        if start_date >= end_date:
            raise serializers.ValidationError('La date de fin doit être après la date de début.')

        if start_date < timezone.now().date():
            raise serializers.ValidationError('La date de début ne peut pas être dans le passé.')

        if property.host == user:
            raise serializers.ValidationError('Vous ne pouvez pas réserver votre propre logement.')

        # Check double booking
        conflict = Booking.objects.filter(
            property=property,
            status__in=['pending', 'confirmed'],
            start_date__lt=end_date,
            end_date__gt=start_date,
        ).exists()

        if conflict:
            raise serializers.ValidationError('Ces dates ne sont pas disponibles.')

        if data.get('guests', 1) > property.max_guests:
            raise serializers.ValidationError(f'Nombre de voyageurs maximum : {property.max_guests}')

        nights = (end_date - start_date).days
        data['total_price'] = property.price_per_night * nights
        return data

    def create(self, validated_data):
        return Booking.objects.create(**validated_data)


class BookingSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)
    user_name = serializers.CharField(source='user.name', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    nights = serializers.SerializerMethodField()

    def get_nights(self, obj):
        return obj.get_nights()

    class Meta:
        model = Booking
        fields = [
            'id', 'user_name', 'user_email', 'property',
            'start_date', 'end_date', 'nights', 'guests', 'message',
            'status', 'total_price', 'created_at', 'updated_at',
        ]

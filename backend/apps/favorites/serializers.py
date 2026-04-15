from rest_framework import serializers
from .models import Favorite
from apps.properties.serializers import PropertyListSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    property = PropertyListSerializer(read_only=True)
    property_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['id', 'property', 'property_id', 'created_at']

    def validate_property_id(self, value):
        from apps.properties.models import Property
        if not Property.objects.filter(id=value, is_active=True).exists():
            raise serializers.ValidationError('Logement introuvable.')
        return value

    def create(self, validated_data):
        from apps.properties.models import Property
        property = Property.objects.get(id=validated_data['property_id'])
        favorite, created = Favorite.objects.get_or_create(
            user=validated_data['user'],
            property=property
        )
        if not created:
            raise serializers.ValidationError('Ce logement est déjà dans vos favoris.')
        return favorite

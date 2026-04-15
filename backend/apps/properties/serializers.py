from rest_framework import serializers
from .models import Property, PropertyImage, Amenity, Availability
from apps.users.serializers import UserSerializer


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ['id', 'name', 'icon']


class PropertyImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = PropertyImage
        fields = ['id', 'image', 'image_url', 'is_primary']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None


class PropertyListSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    avg_rating = serializers.FloatField(read_only=True)
    host_name = serializers.CharField(source='host.name', read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'city', 'price_per_night', 'property_type',
            'max_guests', 'num_bedrooms', 'num_bathrooms',
            'primary_image', 'avg_rating', 'host_name', 'amenities',
            'is_active', 'moderation_status',
        ]

    def get_primary_image(self, obj):
        img = obj.primary_image
        if img:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(img.image.url)
        return None


class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    amenities = AmenitySerializer(many=True, read_only=True)
    host = UserSerializer(read_only=True)
    avg_rating = serializers.FloatField(read_only=True)
    amenity_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )

    class Meta:
        model = Property
        fields = [
            'id', 'host', 'title', 'description', 'price_per_night',
            'city', 'address', 'latitude', 'longitude',
            'property_type', 'max_guests', 'num_bedrooms', 'num_bathrooms',
            'amenities', 'amenity_ids', 'images', 'avg_rating', 'is_active',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'host', 'created_at', 'updated_at']

    def create(self, validated_data):
        amenity_ids = validated_data.pop('amenity_ids', [])
        property = Property.objects.create(**validated_data)
        if amenity_ids:
            amenities = Amenity.objects.filter(id__in=amenity_ids)
            property.amenities.set(amenities)
        return property

    def update(self, instance, validated_data):
        amenity_ids = validated_data.pop('amenity_ids', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if amenity_ids is not None:
            amenities = Amenity.objects.filter(id__in=amenity_ids)
            instance.amenities.set(amenities)
        return instance


class AvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Availability
        fields = ['id', 'date', 'is_available']

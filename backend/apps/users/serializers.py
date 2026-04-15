from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'name', 'password', 'password_confirm', 'role']
        extra_kwargs = {'role': {'default': 'user'}}

    def validate(self, data):
        if data['password'] != data.pop('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'Les mots de passe ne correspondent pas.'})
        return data

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Email ou mot de passe incorrect.')
        if not user.is_active:
            raise serializers.ValidationError('Ce compte est désactivé.')
        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'avatar', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'email', 'role', 'created_at']

    def get_avatar_url(self, obj):
        request = self.context.get('request')
        if obj.avatar and request:
            return request.build_absolute_uri(obj.avatar.url)
        return None


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'avatar']


class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'name', 'role', 'is_active', 'created_at']

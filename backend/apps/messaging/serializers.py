from rest_framework import serializers
from .models import Message


class MessageSerializer(serializers.ModelSerializer):
    sender_id = serializers.IntegerField(source='sender.id', read_only=True)
    sender_name = serializers.CharField(source='sender.name', read_only=True)

    class Meta:
        model = Message
        fields = ['id', 'booking', 'sender_id', 'sender_name', 'content', 'is_read', 'created_at']
        read_only_fields = ['booking', 'sender_id', 'sender_name', 'is_read', 'created_at']

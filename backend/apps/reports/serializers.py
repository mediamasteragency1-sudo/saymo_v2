from rest_framework import serializers
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(source='reporter.name', read_only=True)
    property_title = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            'id', 'reporter_name', 'property', 'property_title',
            'review', 'reason', 'description', 'status', 'admin_note', 'created_at',
        ]
        read_only_fields = ['status', 'admin_note', 'created_at']

    def get_property_title(self, obj):
        return obj.property.title if obj.property else None

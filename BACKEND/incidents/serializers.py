from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Incident,
    IncidentMedia,
    IncidentVerification,
)

User = get_user_model()


# ==================================================
#               INCIDENT MEDIA
# ==================================================
class IncidentMediaSerializer(serializers.ModelSerializer):
    file = serializers.FileField(use_url=True, read_only=True)

    class Meta:
        model = IncidentMedia
        fields = [
            "id",
            "file",
            "media_type",
            "uploaded_at",
        ]
        read_only_fields = fields


# ==================================================
#           INCIDENT VERIFICATION
# ==================================================
class IncidentVerificationSerializer(serializers.ModelSerializer):
    verifier_name = serializers.SerializerMethodField()

    class Meta:
        model = IncidentVerification
        fields = [
            "id",
            "verifier_name",
            "status",
            "remarks",
            "created_at",
        ]
        read_only_fields = fields

    def get_verifier_name(self, obj):
        if obj.verified_by:
            return obj.verified_by.full_name or obj.verified_by.email
        return None


# ==================================================
#                  INCIDENT
# ==================================================
class IncidentSerializer(serializers.ModelSerializer):
    reporter_name = serializers.SerializerMethodField()

    incident_type_display = serializers.CharField(
        source="get_incident_type_display",
        read_only=True
    )
    severity_display = serializers.CharField(
        source="get_severity_display",
        read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    media = IncidentMediaSerializer(many=True, read_only=True)
    verifications = IncidentVerificationSerializer(many=True, read_only=True)

    class Meta:
        model = Incident
        fields = [
            "id",

            # Reporter
            "reporter",
            "reporter_name",

            # Core info
            "title",
            "description",

            # Type & severity
            "incident_type",
            "incident_type_display",
            "severity",
            "severity_display",

            # Location
            "latitude",
            "longitude",

            # Status
            "status",
            "status_display",

            # Extra
            "metadata",

            # Timestamps
            "created_at",
            "updated_at",

            # Nested
            "media",
            "verifications",
        ]

        read_only_fields = [
            "status",
            "created_at",
            "updated_at",
        ]

    def get_reporter_name(self, obj):
        if obj.reporter:
            return obj.reporter.full_name or obj.reporter.email
        return None

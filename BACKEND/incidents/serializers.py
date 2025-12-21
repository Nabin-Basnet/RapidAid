from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Incident,
    IncidentMedia,
    IncidentVerification
)

User = get_user_model()


# --------------------------------------------------
#                  INCIDENT
# --------------------------------------------------
class IncidentSerializer(serializers.ModelSerializer):
    reporter_name = serializers.CharField(
        source="reporter.get_full_name",
        read_only=True
    )
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

    class Meta:
        model = Incident
        fields = [
            "id",
            "reporter",
            "reporter_name",
            "title",
            "description",
            "incident_type",
            "incident_type_display",
            "severity",
            "severity_display",
            "latitude",
            "longitude",
            "status",
            "status_display",
            "metadata",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["status", "created_at", "updated_at"]


# --------------------------------------------------
#               INCIDENT MEDIA
# --------------------------------------------------
class IncidentMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentMedia
        fields = [
            "id",
            "incident",
            "file",
            "media_type",
            "uploaded_at",
        ]


# --------------------------------------------------
#           INCIDENT VERIFICATION
# --------------------------------------------------
class IncidentVerificationSerializer(serializers.ModelSerializer):
    verifier_name = serializers.CharField(
        source="verified_by.get_full_name",
        read_only=True
    )

    class Meta:
        model = IncidentVerification
        fields = [
            "id",
            "incident",
            "verified_by",
            "verifier_name",
            "status",
            "remarks",
            "created_at",
        ]

    def validate(self, attrs):
        if IncidentVerification.objects.filter(
            incident=attrs["incident"],
            verified_by=attrs["verified_by"]
        ).exists():
            raise serializers.ValidationError(
                "You have already verified this incident."
            )
        return attrs

from rest_framework import serializers
from django.utils import timezone
from django.conf import settings

from .models import (
    Incident,
    IncidentMedia,
    IncidentTimeline,
    IncidentStatus
)
from volunteer.models import VolunteerStatus
from RapidAid.email_utils import send_notification_email

User = settings.AUTH_USER_MODEL


# ======================================================
# INCIDENT MEDIA
# ======================================================

class IncidentMediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = IncidentMedia
        fields = [
            "id",
            "file",
            "media_type",
            "uploaded_at"
        ]
        read_only_fields = ["id", "uploaded_at"]


# ======================================================
# INCIDENT TIMELINE
# ======================================================

class IncidentTimelineSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(
        source="created_by.email",
        read_only=True
    )

    class Meta:
        model = IncidentTimeline
        fields = [
            "id",
            "title",
            "description",
            "created_by_name",
            "created_at"
        ]
        read_only_fields = fields


# ======================================================
# INCIDENT CREATE (CITIZEN)
# ======================================================

class IncidentCreateSerializer(serializers.ModelSerializer):
    media = IncidentMediaSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Incident
        fields = [
            "id",
            "title",
            "description",
            "incident_type",
            "severity",
            "location",
            "incident_date",
            "media",
            "status",
            "created_at"
        ]
        read_only_fields = [
            "id",
            "status",
            "created_at"
        ]

    def create(self, validated_data):
        request = self.context["request"]

        incident = Incident.objects.create(
            reporter=request.user,
            **validated_data
        )

        # Create timeline entry
        IncidentTimeline.objects.create(
            incident=incident,
            title="Incident Reported",
            description="Incident reported by citizen",
            created_by=request.user
        )

        return incident


# ======================================================
# INCIDENT PUBLIC VIEW
# ======================================================

class IncidentPublicSerializer(serializers.ModelSerializer):
    media = IncidentMediaSerializer(many=True, read_only=True)
    timeline = IncidentTimelineSerializer(many=True, read_only=True)
    reporter_name = serializers.CharField(
        source="reporter.email",
        read_only=True
    )
    approved_volunteers = serializers.SerializerMethodField()

    def get_approved_volunteers(self, obj):
        approved = obj.volunteers.filter(
            status=VolunteerStatus.APPROVED
        ).select_related("user").order_by("-approved_at")

        return [
            {
                "id": assignment.id,
                "user_id": assignment.user_id,
                "user_name": assignment.user.full_name,
                "user_email": assignment.user.email,
                "remarks": assignment.remarks,
                "approved_at": assignment.approved_at,
            }
            for assignment in approved
        ]

    class Meta:
        model = Incident
        fields = [
            "id",
            "title",
            "description",
            "incident_type",
            "severity",
            "location",
            "incident_date",
            "status",
            "reporter_name",
            "approved_volunteers",
            "media",
            "timeline",
            "created_at",
            "updated_at"
        ]
        read_only_fields = fields


# ======================================================
# INCIDENT ADMIN UPDATE
# ======================================================

class IncidentAdminUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Incident
        fields = [
            "status"
        ]

    def validate_status(self, value):
        instance = self.instance

        if instance.status == IncidentStatus.RESOLVED:
            raise serializers.ValidationError(
                "Resolved incident cannot be modified"
            )

        allowed = [
            IncidentStatus.VERIFIED,
            IncidentStatus.REJECTED,
            IncidentStatus.IN_RESCUE,
            IncidentStatus.RESOLVED,
        ]

        if value not in allowed:
            raise serializers.ValidationError("Invalid status transition")

        return value

    def update(self, instance, validated_data):
        request = self.context["request"]
        new_status = validated_data["status"]
        previous_status = instance.status

        instance.status = new_status

        # Admin approval info
        if new_status == IncidentStatus.VERIFIED:
            instance.approved_by = request.user
            instance.approved_at = timezone.now()

        instance.save()

        # Timeline entry
        IncidentTimeline.objects.create(
            incident=instance,
            title=f"Incident {new_status.replace('_', ' ').title()}",
            description=f"Status updated to {new_status}",
            created_by=request.user
        )

        if (
            previous_status != IncidentStatus.VERIFIED
            and new_status == IncidentStatus.VERIFIED
            and instance.reporter_id
        ):
            send_notification_email(
                to_email=instance.reporter.email,
                subject="RapidAid: Incident Approved",
                message=(
                    f"Hello {instance.reporter.full_name},\n\n"
                    f"Your incident '{instance.title}' has been approved and marked as verified.\n"
                    "You can now open RapidAid to track updates and community support.\n\n"
                    "Thank you,\nRapidAid Team"
                ),
            )

        return instance

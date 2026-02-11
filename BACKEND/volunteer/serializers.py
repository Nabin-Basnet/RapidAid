from rest_framework import serializers
from .models import VolunteerAssignment


class VolunteerAssignmentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.full_name",
        read_only=True
    )
    incident_title = serializers.CharField(
        source="incident.title",
        read_only=True
    )

    class Meta:
        model = VolunteerAssignment
        fields = "__all__"
        read_only_fields = [
            "user",
            "status",
            "applied_at",
            "approved_at",
            "completed_at",
        ]


class AdminVolunteerUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = VolunteerAssignment
        fields = ["status"]

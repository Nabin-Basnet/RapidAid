from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    RescueTeam,
    RescueTeamMember,
    RescueAssignment,
    RescueUpdate
)

User = get_user_model()


# -----------------------------------------------------
#                   RESCUE TEAM
# -----------------------------------------------------
class RescueTeamSerializer(serializers.ModelSerializer):
    team_type_display = serializers.CharField(
        source="get_team_type_display",
        read_only=True
    )

    class Meta:
        model = RescueTeam
        fields = [
            "id",
            "name",
            "team_type",
            "team_type_display",
            "contact_phone",
            "created_at",
        ]


# -----------------------------------------------------
#               RESCUE TEAM MEMBER
# -----------------------------------------------------
class RescueTeamMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.get_full_name",
        read_only=True
    )
    team_name = serializers.CharField(
        source="team.name",
        read_only=True
    )

    class Meta:
        model = RescueTeamMember
        fields = [
            "id",
            "user",
            "user_name",
            "team",
            "team_name",
            "role",
            "joined_at",
        ]

    def validate(self, attrs):
        if RescueTeamMember.objects.filter(
            user=attrs["user"],
            team=attrs["team"]
        ).exists():
            raise serializers.ValidationError(
                "This user is already a member of this rescue team."
            )
        return attrs


# -----------------------------------------------------
#               RESCUE ASSIGNMENT
# -----------------------------------------------------
class RescueAssignmentSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(
        source="team.name",
        read_only=True
    )
    status_display = serializers.CharField(
        source="get_status_display",
        read_only=True
    )

    class Meta:
        model = RescueAssignment
        fields = [
            "id",
            "incident",
            "team",
            "team_name",
            "assigned_at",
            "arrival_time",
            "completion_time",
            "status",
            "status_display",
            "notes",
        ]

    def validate(self, attrs):
        if attrs.get("arrival_time") and attrs["arrival_time"] < attrs["assigned_at"]:
            raise serializers.ValidationError(
                "Arrival time cannot be before assigned time."
            )
        return attrs


# -----------------------------------------------------
#               RESCUE UPDATE
# -----------------------------------------------------
class RescueUpdateSerializer(serializers.ModelSerializer):
    assignment_status = serializers.CharField(
        source="assignment.status",
        read_only=True
    )

    class Meta:
        model = RescueUpdate
        fields = [
            "id",
            "assignment",
            "assignment_status",
            "update_text",
            "file_url",
            "status_update",
            "created_at",
        ]

from rest_framework import serializers
from .models import VolunteerAssignment


class VolunteerAssignmentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.full_name",
        read_only=True
    )
    user_email = serializers.CharField(
        source="user.email",
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

    def validate_status(self, value):
        instance = self.instance
        current = instance.status if instance else None

        # Completed assignments are terminal.
        if current == "completed":
            raise serializers.ValidationError("Completed volunteer assignment cannot be changed.")

        allowed_transitions = {
            "pending": {"approved", "rejected"},
            "approved": {"completed", "rejected", "suspended"},
            "suspended": {"approved", "rejected"},
            "rejected": {"approved"},
        }

        if current in allowed_transitions and value not in allowed_transitions[current]:
            raise serializers.ValidationError(
                f"Cannot change volunteer status from '{current}' to '{value}'."
            )

        return value

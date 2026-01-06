from rest_framework import serializers
from .models import RescueTeam, RescueTeamMember, RescueAssignment


# -----------------------------------------
# RESCUE TEAM
# -----------------------------------------
class RescueTeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = RescueTeam
        fields = "__all__"


# -----------------------------------------
# RESCUE TEAM MEMBER
# -----------------------------------------
class RescueTeamMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.full_name",
        read_only=True
    )

    class Meta:
        model = RescueTeamMember
        fields = "__all__"


# -----------------------------------------
# RESCUE ASSIGNMENT
# -----------------------------------------
class RescueAssignmentSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(
        source="team.name",
        read_only=True
    )
    incident_title = serializers.CharField(
        source="incident.title",
        read_only=True
    )

    class Meta:
        model = RescueAssignment
        fields = "__all__"

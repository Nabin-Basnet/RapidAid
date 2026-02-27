from rest_framework import serializers
from .models import RescueTeam, RescueTeamMember, RescueAssignment
from Authapp.models import UserRole
from volunteer.models import VolunteerAssignment, VolunteerStatus


# -----------------------------------------
# RESCUE TEAM MEMBER
# -----------------------------------------
class RescueTeamMemberSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.full_name",
        read_only=True
    )
    user_email = serializers.CharField(
        source="user.email",
        read_only=True
    )
    team_name = serializers.CharField(
        source="team.name",
        read_only=True
    )

    class Meta:
        model = RescueTeamMember
        fields = ["id", "team", "team_name", "user", "user_name", "user_email", "role"]
        read_only_fields = ["id", "team_name", "user_name", "user_email"]

    def validate(self, attrs):
        team = attrs.get("team")
        user = attrs.get("user")

        if user and user.role not in [UserRole.RESCUE_TEAM, UserRole.ADMIN]:
            has_volunteer_interest = VolunteerAssignment.objects.filter(
                user=user,
                status__in=[VolunteerStatus.PENDING, VolunteerStatus.APPROVED],
            ).exists()
            if not has_volunteer_interest:
                raise serializers.ValidationError(
                    {"user": "Select an admin/rescue user or a user with volunteer interest."}
                )

        if team and user and RescueTeamMember.objects.filter(team=team, user=user).exists():
            raise serializers.ValidationError(
                {"user": "This user is already a member of the selected team."}
            )

        return attrs


# -----------------------------------------
# RESCUE TEAM
# -----------------------------------------
class RescueTeamSerializer(serializers.ModelSerializer):
    members = RescueTeamMemberSerializer(many=True, read_only=True)
    member_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = RescueTeam
        fields = ["id", "name", "organization", "created_at", "member_count", "members"]
        read_only_fields = ["id", "created_at", "member_count", "members"]

    def get_member_count(self, obj):
        return obj.members.count()


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

    def validate(self, attrs):
        incident = attrs.get("incident")
        team = attrs.get("team")

        if (
            incident
            and team
            and RescueAssignment.objects.filter(
                incident=incident,
                team=team,
            ).exclude(status="completed").exists()
        ):
            raise serializers.ValidationError(
                "An active assignment already exists for this team and incident."
            )
        return attrs


# -----------------------------------------
# RESCUE STATUS UPDATE
# -----------------------------------------
class RescueStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = RescueAssignment
        fields = ["status"]

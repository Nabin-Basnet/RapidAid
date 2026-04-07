from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.utils import timezone

from .models import RescueTeam, RescueTeamMember, RescueAssignment
from .serializers import (
    RescueTeamSerializer,
    RescueTeamMemberSerializer,
    RescueAssignmentSerializer,
    RescueStatusUpdateSerializer,
)
from Authapp.permissions import IsAdminRole
from incidents.models import IncidentStatus
from ledger.utils import create_ledger_entry


# =========================================
# ADMIN: CREATE RESCUE TEAM
# =========================================
class CreateRescueTeamAPIView(generics.CreateAPIView):
    serializer_class = RescueTeamSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        team = serializer.save()
        create_ledger_entry(
            module="rescue_teams",
            reference_id=team.id,
            action="created",
            changed_by=self.request.user,
            new_data={"name": team.name, "organization": team.organization},
            note="Rescue team created.",
        )


# =========================================
# ADMIN: ADD TEAM MEMBER
# =========================================
class AddRescueTeamMemberAPIView(generics.CreateAPIView):
    serializer_class = RescueTeamMemberSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        member = serializer.save()
        create_ledger_entry(
            module="rescue_team_members",
            reference_id=member.id,
            action="created",
            changed_by=self.request.user,
            new_data={"team_id": member.team_id, "user_id": member.user_id, "role": member.role},
            note="Rescue team member added.",
        )


class RemoveRescueTeamMemberAPIView(generics.DestroyAPIView):
    queryset = RescueTeamMember.objects.select_related("team", "user")
    permission_classes = [IsAdminRole]

    def destroy(self, request, *args, **kwargs):
        member = self.get_object()
        create_ledger_entry(
            module="rescue_team_members",
            reference_id=member.id,
            action="deleted",
            changed_by=request.user,
            old_data={"team_id": member.team_id, "user_id": member.user_id, "role": member.role},
            note="Rescue team member removed.",
        )
        self.perform_destroy(member)
        return Response(status=status.HTTP_204_NO_CONTENT)


class RescueTeamListAPIView(generics.ListAPIView):
    serializer_class = RescueTeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = RescueTeam.objects.prefetch_related("members").order_by("-id")
        user = self.request.user
        if user.is_admin_role:
            return qs
        return qs.filter(members__user=user).distinct()


class DeleteRescueTeamAPIView(generics.DestroyAPIView):
    queryset = RescueTeam.objects.prefetch_related("members", "assignments")
    permission_classes = [IsAdminRole]

    def destroy(self, request, *args, **kwargs):
        team = self.get_object()

        has_active_assignments = team.assignments.exclude(status="completed").exists()
        if has_active_assignments:
            raise PermissionDenied("Cannot delete a rescue team with active assignments.")

        create_ledger_entry(
            module="rescue_teams",
            reference_id=team.id,
            action="deleted",
            changed_by=request.user,
            old_data={
                "name": team.name,
                "organization": team.organization,
                "member_count": team.members.count(),
            },
            note="Rescue team deleted.",
        )
        self.perform_destroy(team)
        return Response(status=status.HTTP_204_NO_CONTENT)


# =========================================
# ADMIN: ASSIGN TEAM TO INCIDENT
# =========================================
class AssignRescueTeamAPIView(generics.CreateAPIView):
    serializer_class = RescueAssignmentSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        incident = serializer.validated_data["incident"]

        if incident.status not in [IncidentStatus.VERIFIED, IncidentStatus.IN_RESCUE]:
            raise PermissionDenied("Incident must be verified or already in rescue")

        assignment = serializer.save()
        if incident.status != IncidentStatus.IN_RESCUE:
            incident.status = IncidentStatus.IN_RESCUE
            incident.save(update_fields=["status"])
        create_ledger_entry(
            module="rescue_assignments",
            reference_id=assignment.id,
            action="created",
            changed_by=self.request.user,
            new_data={"incident_id": assignment.incident_id, "team_id": assignment.team_id, "status": assignment.status},
            note="Rescue team assigned to incident.",
        )


# =========================================
# LIST RESCUE ASSIGNMENTS (PUBLIC)
# =========================================
class RescueAssignmentListAPIView(generics.ListAPIView):
    serializer_class = RescueAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = RescueAssignment.objects.select_related("team", "incident").order_by("-id")
        if user.is_admin_role:
            return qs
        return qs.filter(team__members__user=user).distinct()


# =========================================
# UPDATE RESCUE STATUS (TEAM MEMBER)
# =========================================
class UpdateRescueStatusAPIView(generics.UpdateAPIView):
    serializer_class = RescueStatusUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = RescueAssignment.objects.all()

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return RescueStatusUpdateSerializer
        return RescueAssignmentSerializer

    def perform_update(self, serializer):
        assignment = self.get_object()
        user = self.request.user
        previous_status = assignment.status

        # Only rescue team members or admin
        if not (
            user.is_admin_role or
            assignment.team.members.filter(user=user).exists()
        ):
            raise PermissionDenied("Not allowed")

        status = serializer.validated_data.get("status")

        if status == "active":
            serializer.save(started_at=timezone.now())
        elif status == "completed":
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()

        assignment.refresh_from_db()
        create_ledger_entry(
            module="rescue_assignments",
            reference_id=assignment.id,
            action="updated",
            changed_by=user,
            old_data={"status": previous_status},
            new_data={"status": assignment.status},
            note="Rescue assignment status updated.",
        )

from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone

from .models import RescueTeam, RescueTeamMember, RescueAssignment
from .serializers import (
    RescueTeamSerializer,
    RescueTeamMemberSerializer,
    RescueAssignmentSerializer
)
from Authapp.permissions import IsAdminRole
from incidents.models import IncidentStatus


# =========================================
# ADMIN: CREATE RESCUE TEAM
# =========================================
class CreateRescueTeamAPIView(generics.CreateAPIView):
    serializer_class = RescueTeamSerializer
    permission_classes = [IsAdminRole]


# =========================================
# ADMIN: ADD TEAM MEMBER
# =========================================
class AddRescueTeamMemberAPIView(generics.CreateAPIView):
    serializer_class = RescueTeamMemberSerializer
    permission_classes = [IsAdminRole]


# =========================================
# ADMIN: ASSIGN TEAM TO INCIDENT
# =========================================
class AssignRescueTeamAPIView(generics.CreateAPIView):
    serializer_class = RescueAssignmentSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        incident = serializer.validated_data["incident"]

        if incident.status != IncidentStatus.VERIFIED:
            raise PermissionDenied("Incident must be verified")

        serializer.save()


# =========================================
# LIST RESCUE ASSIGNMENTS (PUBLIC)
# =========================================
class RescueAssignmentListAPIView(generics.ListAPIView):
    serializer_class = RescueAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = RescueAssignment.objects.all().order_by("-id")


# =========================================
# UPDATE RESCUE STATUS (TEAM MEMBER)
# =========================================
class UpdateRescueStatusAPIView(generics.UpdateAPIView):
    serializer_class = RescueAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = RescueAssignment.objects.all()

    def perform_update(self, serializer):
        assignment = self.get_object()
        user = self.request.user

        # Only rescue team members or admin
        if not (
            user.is_admin_role or
            assignment.team.members.filter(user=user).exists()
        ):
            raise PermissionDenied("Not allowed")

        status = self.request.data.get("status")

        if status == "active":
            serializer.save(started_at=timezone.now())
        elif status == "completed":
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()

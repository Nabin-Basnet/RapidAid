from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone

from .models import VolunteerAssignment, VolunteerStatus
from .serializers import VolunteerAssignmentSerializer
from Authapp.permissions import IsAdminRole
from incidents.models import IncidentStatus


# =========================================
# APPLY AS VOLUNTEER (CITIZEN)
# =========================================
class ApplyVolunteerAPIView(generics.CreateAPIView):
    serializer_class = VolunteerAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        incident = serializer.validated_data["incident"]

        if not user.is_citizen:
            raise PermissionDenied("Only citizens can volunteer")

        if incident.status != IncidentStatus.VERIFIED:
            raise PermissionDenied("Incident not open for volunteering")

        # Check active volunteer work
        active = VolunteerAssignment.objects.filter(
            user=user,
            status__in=[
                VolunteerStatus.PENDING,
                VolunteerStatus.APPROVED
            ]
        ).exists()

        if active:
            raise PermissionDenied(
                "You are already volunteering in another incident"
            )

        serializer.save(user=user)


# =========================================
# ADMIN: APPROVE / REJECT VOLUNTEER
# =========================================
class AdminUpdateVolunteerAPIView(generics.UpdateAPIView):
    serializer_class = VolunteerAssignmentSerializer
    permission_classes = [IsAdminRole]
    queryset = VolunteerAssignment.objects.all()

    def perform_update(self, serializer):
        status = self.request.data.get("status")

        if status == VolunteerStatus.APPROVED:
            serializer.save(approved_at=timezone.now())
        elif status == VolunteerStatus.COMPLETED:
            serializer.save(completed_at=timezone.now())
        else:
            serializer.save()


# =========================================
# LIST VOLUNTEERS (PUBLIC)
# =========================================
class VolunteerListAPIView(generics.ListAPIView):
    serializer_class = VolunteerAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = VolunteerAssignment.objects.all().order_by("-applied_at")

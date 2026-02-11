from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Incident, IncidentMedia, IncidentStatus
from .serializers import (
    IncidentCreateSerializer,
    IncidentPublicSerializer,
    IncidentAdminUpdateSerializer,
    IncidentMediaSerializer
)

from Authapp.permissions import IsAdminRole


# ======================================================
# REPORT INCIDENT (CITIZEN)
# ======================================================

class ReportIncidentAPIView(generics.CreateAPIView):
    serializer_class = IncidentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_citizen:
            raise PermissionDenied("Only citizens can report incidents")
        serializer.save()


# ======================================================
# INCIDENT MEDIA UPLOAD
# ======================================================

class IncidentMediaUploadAPIView(generics.CreateAPIView):
    serializer_class = IncidentMediaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        incident_id = self.kwargs.get("incident_id")
        incident = Incident.objects.get(id=incident_id)

        if (
            self.request.user != incident.reporter
            and not self.request.user.is_admin_role
        ):
            raise PermissionDenied("Not allowed")

        serializer.save(
            incident=incident,
            uploaded_by=self.request.user
        )


# ======================================================
# PUBLIC INCIDENT LIST
# ======================================================

class IncidentListAPIView(generics.ListAPIView):
    serializer_class = IncidentPublicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Incident.objects.exclude(
            status=IncidentStatus.REJECTED
        ).select_related(
            "reporter"
        ).prefetch_related(
            "media",
            "timeline",
            "volunteers__user",
        ).order_by("-created_at")


# ======================================================
# INCIDENT DETAIL
# ======================================================

class IncidentDetailAPIView(generics.RetrieveAPIView):
    serializer_class = IncidentPublicSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Incident.objects.select_related(
        "reporter"
    ).prefetch_related(
        "media",
        "timeline",
        "volunteers__user",
    )


# ======================================================
# ADMIN INCIDENT UPDATE
# ======================================================

class IncidentAdminUpdateAPIView(generics.UpdateAPIView):
    serializer_class = IncidentAdminUpdateSerializer
    permission_classes = [IsAdminRole]
    queryset = Incident.objects.all()

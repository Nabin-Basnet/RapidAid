from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from .models import Incident, IncidentMedia, IncidentStatus
from .serializers import (
    IncidentCreateSerializer,
    IncidentPublicSerializer,
    IncidentAdminUpdateSerializer,
    IncidentMediaSerializer
)

from Authapp.permissions import IsAdminRole
from ledger.utils import create_ledger_entry


# ======================================================
# REPORT INCIDENT (CITIZEN)
# ======================================================

class ReportIncidentAPIView(generics.CreateAPIView):
    serializer_class = IncidentCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not self.request.user.is_citizen:
            raise PermissionDenied("Only citizens can report incidents")
        incident = serializer.save()
        create_ledger_entry(
            module="incidents",
            reference_id=incident.id,
            action="created",
            changed_by=self.request.user,
            new_data={"status": incident.status, "title": incident.title},
            note="Incident reported by citizen.",
        )


# ======================================================
# INCIDENT MEDIA UPLOAD
# ======================================================

class IncidentMediaUploadAPIView(generics.CreateAPIView):
    serializer_class = IncidentMediaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        incident_id = self.kwargs.get("incident_id")
        incident = get_object_or_404(Incident, id=incident_id)

        if (
            self.request.user != incident.reporter
            and not self.request.user.is_admin_role
        ):
            raise PermissionDenied("Not allowed")

        media = serializer.save(
            incident=incident,
            uploaded_by=self.request.user
        )
        create_ledger_entry(
            module="incident_media",
            reference_id=media.id,
            action="created",
            changed_by=self.request.user,
            new_data={"incident_id": incident.id, "media_type": media.media_type},
            note="Incident media uploaded.",
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

    def perform_update(self, serializer):
        incident = self.get_object()
        previous_status = incident.status
        updated = serializer.save()
        create_ledger_entry(
            module="incidents",
            reference_id=updated.id,
            action="updated",
            changed_by=self.request.user,
            old_data={"status": previous_status},
            new_data={"status": updated.status},
            note="Admin updated incident status.",
        )

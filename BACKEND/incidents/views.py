from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser

from .models import (
    Incident,
    IncidentVerification,
    IncidentStatus,
    IncidentMedia
)
from .serializers import (
    IncidentSerializer,
    IncidentVerificationSerializer
)


# ==================================================
#                   INCIDENT
# ==================================================
class IncidentViewSet(viewsets.ModelViewSet):
    serializer_class = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Required for file uploads
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        return (
            Incident.objects
            .select_related("reporter")
            .prefetch_related("media", "verifications")
            .order_by("-created_at")
        )

    def perform_create(self, serializer):
        # 1️⃣ Save incident with the authenticated user as reporter
        incident = serializer.save(reporter=self.request.user)

        # 2️⃣ Save uploaded media
        files = self.request.FILES.getlist("media")
        for file in files:
            media_type = "video" if file.content_type.startswith("video") else "photo"
            IncidentMedia.objects.create(
                incident=incident,
                file=file,
                media_type=media_type
            )

    # -------------------------------
    # Incident Status Actions
    # -------------------------------
    @action(detail=True, methods=["post"])
    def mark_in_rescue(self, request, pk=None):
        incident = self.get_object()
        incident.status = IncidentStatus.IN_RESCUE
        incident.save(update_fields=["status"])
        return Response(
            {"message": "Incident marked as IN RESCUE"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.status = IncidentStatus.RESOLVED
        incident.save(update_fields=["status"])
        return Response(
            {"message": "Incident resolved successfully"},
            status=status.HTTP_200_OK
        )


# ==================================================
#           INCIDENT VERIFICATION
# ==================================================
class IncidentVerificationViewSet(viewsets.ModelViewSet):
    serializer_class = IncidentVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return IncidentVerification.objects.select_related(
            "incident", "verified_by"
        )

    def perform_create(self, serializer):
        verification = serializer.save(verified_by=self.request.user)
        self._update_incident_status(verification)

    def _update_incident_status(self, verification):
        incident = verification.incident

        if verification.status == "approved":
            incident.status = IncidentStatus.VERIFIED
        elif verification.status in ["rejected", "duplicate"]:
            incident.status = IncidentStatus.REJECTED

        incident.save(update_fields=["status"])

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone

from .models import (
    Incident,
    IncidentMedia,
    IncidentVerification,
    IncidentStatus
)
from .serializers import (
    IncidentSerializer,
    IncidentMediaSerializer,
    IncidentVerificationSerializer
)


# --------------------------------------------------
#                   INCIDENT API
# --------------------------------------------------
class IncidentViewSet(viewsets.ModelViewSet):
    queryset = Incident.objects.select_related("reporter")
    serializer_class = IncidentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(reporter=self.request.user)

    @action(detail=True, methods=["post"])
    def mark_in_rescue(self, request, pk=None):
        incident = self.get_object()
        incident.status = IncidentStatus.IN_RESCUE
        incident.save()
        return Response(
            {"message": "Incident marked as IN RESCUE"},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=["post"])
    def resolve(self, request, pk=None):
        incident = self.get_object()
        incident.status = IncidentStatus.RESOLVED
        incident.save()
        return Response(
            {"message": "Incident resolved successfully"},
            status=status.HTTP_200_OK
        )


# --------------------------------------------------
#              INCIDENT MEDIA API
# --------------------------------------------------
class IncidentMediaViewSet(viewsets.ModelViewSet):
    queryset = IncidentMedia.objects.select_related("incident")
    serializer_class = IncidentMediaSerializer
    permission_classes = [permissions.IsAuthenticated]


# --------------------------------------------------
#          INCIDENT VERIFICATION API
# --------------------------------------------------
class IncidentVerificationViewSet(viewsets.ModelViewSet):
    queryset = IncidentVerification.objects.select_related(
        "incident", "verified_by"
    )
    serializer_class = IncidentVerificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(verified_by=self.request.user)

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        verification = self.get_queryset().get(id=response.data["id"])
        incident = verification.incident

        if verification.status == "approved":
            incident.status = IncidentStatus.VERIFIED
        elif verification.status in ["rejected", "duplicate"]:
            incident.status = IncidentStatus.REJECTED

        incident.save()
        return response

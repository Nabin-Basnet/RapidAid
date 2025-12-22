from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status

from .models import DamageAssessment, AffectedFamily
from .serializers import (
    DamageAssessmentSerializer,
    AffectedFamilySerializer
)


# --------------------------------------------------
#          DAMAGE ASSESSMENT API
# --------------------------------------------------
class DamageAssessmentViewSet(viewsets.ModelViewSet):
    queryset = DamageAssessment.objects.select_related(
        "incident", "assessed_by"
    )
    serializer_class = DamageAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(assessed_by=self.request.user)


# --------------------------------------------------
#           AFFECTED FAMILY API
# --------------------------------------------------
class AffectedFamilyViewSet(viewsets.ModelViewSet):
    queryset = AffectedFamily.objects.select_related("incident")
    serializer_class = AffectedFamilySerializer
    permission_classes = [permissions.IsAuthenticated]

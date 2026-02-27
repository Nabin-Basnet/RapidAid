from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import AffectedFamily, LossAssessment
from .serializers import (
    AffectedFamilySerializer,
    LossAssessmentSerializer
)
from Authapp.permissions import IsAdminRole
from incidents.models import IncidentStatus
from ledger.utils import create_ledger_entry


# =========================================
# ADD AFFECTED FAMILY (ADMIN / ASSESSMENT)
# =========================================
class AddAffectedFamilyAPIView(generics.CreateAPIView):
    serializer_class = AffectedFamilySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        incident = serializer.validated_data["incident"]

        if not (user.is_admin_role or user.is_assessment_team):
            raise PermissionDenied("Not allowed")

        if incident.status != IncidentStatus.VERIFIED:
            raise PermissionDenied("Incident must be verified first")

        family = serializer.save()
        create_ledger_entry(
            module="affected_families",
            reference_id=family.id,
            action="created",
            changed_by=user,
            new_data={"incident_id": family.incident_id, "head_of_family_name": family.head_of_family_name},
            note="Affected family record added.",
        )


# =========================================
# LIST AFFECTED FAMILIES
# =========================================
class AffectedFamilyListAPIView(generics.ListAPIView):
    serializer_class = AffectedFamilySerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = AffectedFamily.objects.all().order_by("-created_at")


# =========================================
# LOSS ASSESSMENT CREATE / UPDATE
# =========================================
class LossAssessmentAPIView(generics.CreateAPIView):
    serializer_class = LossAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if not (user.is_admin_role or user.is_assessment_team):
            raise PermissionDenied("Not allowed")

        assessment = serializer.save(assessed_by=user)
        create_ledger_entry(
            module="loss_assessments",
            reference_id=assessment.id,
            action="created",
            changed_by=user,
            new_data={
                "family_id": assessment.family_id,
                "house_damage": assessment.house_damage,
                "estimated_property_loss": str(assessment.estimated_property_loss),
            },
            note="Loss assessment recorded.",
        )


# =========================================
# LOSS ASSESSMENT LIST
# =========================================
class LossAssessmentListAPIView(generics.ListAPIView):
    serializer_class = LossAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = LossAssessment.objects.all().order_by("-assessed_at")


# =========================================
# LOSS ASSESSMENT DETAIL
# =========================================
class LossAssessmentDetailAPIView(generics.RetrieveAPIView):
    serializer_class = LossAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = LossAssessment.objects.all()

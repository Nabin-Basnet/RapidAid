from rest_framework import serializers
from .models import AffectedFamily, LossAssessment


# -----------------------------------------
# Affected Family
# -----------------------------------------
class AffectedFamilySerializer(serializers.ModelSerializer):
    incident_title = serializers.CharField(
        source="incident.title",
        read_only=True
    )

    class Meta:
        model = AffectedFamily
        fields = "__all__"
        read_only_fields = ["created_at"]


# -----------------------------------------
# Loss Assessment
# -----------------------------------------
class LossAssessmentSerializer(serializers.ModelSerializer):
    family_name = serializers.CharField(
        source="family.head_of_family_name",
        read_only=True
    )

    class Meta:
        model = LossAssessment
        fields = "__all__"
        read_only_fields = ["assessed_by", "assessed_at"]

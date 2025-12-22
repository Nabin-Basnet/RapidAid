from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import DamageAssessment, AffectedFamily

User = get_user_model()


# --------------------------------------------------
#             DAMAGE ASSESSMENT
# --------------------------------------------------
class DamageAssessmentSerializer(serializers.ModelSerializer):
    assessed_by_name = serializers.CharField(
        source="assessed_by.get_full_name",
        read_only=True
    )

    class Meta:
        model = DamageAssessment
        fields = [
            "id",
            "incident",
            "casualties",
            "injured",
            "displaced_families",
            "economic_loss_estimate",
            "description",
            "assessed_by",
            "assessed_by_name",
            "assessed_at",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "assessed_by",
            "assessed_at",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        if DamageAssessment.objects.filter(
            incident=attrs["incident"]
        ).exists():
            raise serializers.ValidationError(
                "Damage assessment already exists for this incident."
            )
        return attrs


# --------------------------------------------------
#              AFFECTED FAMILY
# --------------------------------------------------
class AffectedFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = AffectedFamily
        fields = [
            "id",
            "incident",
            "head_of_family_name",
            "number_of_members",
            "contact",
            "address",
            "lost_home",
            "notes",
            "created_at",
        ]
        read_only_fields = ["created_at"]

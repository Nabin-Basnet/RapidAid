from django.db import models
from django.conf import settings
from incidents.models import Incident


# =========================================
# AFFECTED FAMILY
# =========================================
class AffectedFamily(models.Model):
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="affected_families"
    )

    head_of_family_name = models.CharField(max_length=150)
    contact_number = models.CharField(max_length=20)
    address = models.CharField(max_length=255)

    total_members = models.PositiveIntegerField()
    injured_members = models.PositiveIntegerField(default=0)
    deceased_members = models.PositiveIntegerField(default=0)

    is_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.head_of_family_name} - {self.incident.title}"


# =========================================
# LOSS ASSESSMENT
# =========================================
class LossAssessment(models.Model):
    family = models.OneToOneField(
        AffectedFamily,
        on_delete=models.CASCADE,
        related_name="loss_assessment"
    )

    house_damage = models.CharField(
        max_length=50,
        choices=[
            ("none", "No Damage"),
            ("partial", "Partial Damage"),
            ("full", "Fully Damaged"),
        ]
    )

    estimated_property_loss = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )

    livestock_lost = models.PositiveIntegerField(default=0)
    crops_lost = models.BooleanField(default=False)

    remarks = models.TextField(blank=True)

    assessed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )

    assessed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Loss Assessment - {self.family.head_of_family_name}"

from django.db import models
from django.utils import timezone
from django.conf import settings

User = settings.AUTH_USER_MODEL


# --------------------------------------
#           DAMAGE ASSESSMENT
# --------------------------------------

class DamageAssessment(models.Model):
    incident = models.OneToOneField(
        'incidents.Incident',
        on_delete=models.CASCADE,
        related_name='damage_assessment'
    )

    casualties = models.PositiveIntegerField(default=0)
    injured = models.PositiveIntegerField(default=0)
    displaced_families = models.PositiveIntegerField(default=0)

    economic_loss_estimate = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    description = models.TextField(blank=True)

    assessed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assessments_done'
    )

    assessed_at = models.DateTimeField(default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Assessment for Incident {self.incident_id}"


# --------------------------------------
#              AFFECTED FAMILY
# --------------------------------------

class AffectedFamily(models.Model):
    incident = models.ForeignKey(
        'incidents.Incident',
        on_delete=models.CASCADE,
        related_name='affected_families'
    )

    head_of_family_name = models.CharField(max_length=150)
    number_of_members = models.PositiveIntegerField(default=1)
    contact = models.CharField(max_length=100, blank=True)

    address = models.TextField(blank=True)
    lost_home = models.BooleanField(default=False)
    notes = models.TextField(blank=True)

    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.head_of_family_name} ({self.number_of_members})"

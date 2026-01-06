from django.db import models
from django.conf import settings
from incidents.models import Incident


# =========================================
# RESCUE TEAM
# =========================================
class RescueTeam(models.Model):
    name = models.CharField(max_length=150)
    organization = models.CharField(max_length=150)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


# =========================================
# RESCUE TEAM MEMBER
# =========================================
class RescueTeamMember(models.Model):
    team = models.ForeignKey(
        RescueTeam,
        on_delete=models.CASCADE,
        related_name="members"
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )

    role = models.CharField(
        max_length=100,
        help_text="e.g. Leader, Medic, Engineer"
    )

    def __str__(self):
        return f"{self.user.full_name} ({self.team.name})"


# =========================================
# RESCUE ASSIGNMENT
# =========================================
class RescueAssignment(models.Model):
    STATUS_CHOICES = [
        ("assigned", "Assigned"),
        ("active", "Active"),
        ("completed", "Completed"),
    ]

    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="rescue_assignments"
    )

    team = models.ForeignKey(
        RescueTeam,
        on_delete=models.CASCADE,
        related_name="assignments"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="assigned"
    )

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.team.name} → {self.incident.title}"

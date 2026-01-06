from django.db import models
from django.conf import settings
from incidents.models import Incident


class VolunteerStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    COMPLETED = "completed", "Completed"


class VolunteerAssignment(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="volunteer_assignments"
    )

    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="volunteers"
    )

    status = models.CharField(
        max_length=20,
        choices=VolunteerStatus.choices,
        default=VolunteerStatus.PENDING
    )

    applied_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    remarks = models.TextField(blank=True)

    class Meta:
        unique_together = ("user", "incident")

    def __str__(self):
        return f"{self.user.email} - {self.incident.title}"

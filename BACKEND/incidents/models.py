from django.db import models
from django.utils import timezone
from django.conf import settings

User = settings.AUTH_USER_MODEL


# ======================================================
# ENUMS
# ======================================================

class IncidentStatus(models.TextChoices):
    REPORTED = "reported", "Reported"
    VERIFIED = "verified", "Verified"
    REJECTED = "rejected", "Rejected"
    IN_RESCUE = "in_rescue", "In Rescue"
    RESOLVED = "resolved", "Resolved"


class IncidentType(models.TextChoices):
    FIRE = "fire", "Fire"
    FLOOD = "flood", "Flood"
    LANDSLIDE = "landslide", "Landslide"
    EARTHQUAKE = "earthquake", "Earthquake"
    ACCIDENT = "accident", "Accident"
    OTHER = "other", "Other"


class Severity(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    CRITICAL = "critical", "Critical"


# ======================================================
# INCIDENT
# ======================================================

class Incident(models.Model):
    # Reporter (Citizen)
    reporter = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name="reported_incidents"
    )

    title = models.CharField(max_length=255)
    description = models.TextField()

    incident_type = models.CharField(
        max_length=30,
        choices=IncidentType.choices
    )

    severity = models.CharField(
        max_length=20,
        choices=Severity.choices
    )

    # Location (simple text now, can expand later)
    location = models.CharField(max_length=255)

    # Date of actual incident
    incident_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=IncidentStatus.choices,
        default=IncidentStatus.REPORTED
    )

    # Admin approval info
    approved_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_incidents"
    )
    approved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["incident_type"]),
        ]

    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


# ======================================================
# INCIDENT MEDIA
# ======================================================

class IncidentMedia(models.Model):
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="media"
    )

    file = models.FileField(upload_to="incidents/media/")
    media_type = models.CharField(
        max_length=10,
        choices=[("photo", "Photo"), ("video", "Video")]
    )

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Media for Incident {self.incident_id}"


# ======================================================
# INCIDENT TIMELINE (TRANSPARENCY)
# ======================================================

class IncidentTimeline(models.Model):
    """
    Public readable timeline:
    - reported
    - verified
    - rescue started
    - assessment done
    - resolved
    """

    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="timeline"
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Timeline entry for Incident {self.incident_id}"

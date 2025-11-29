from django.db import models
from django.utils import timezone
from django.conf import settings

User = settings.AUTH_USER_MODEL


# -------------------------------
#   ENUM / CHOICE CLASSES
# -------------------------------

class IncidentStatus(models.TextChoices):
    REPORTED = 'reported', 'Reported'
    VERIFIED = 'verified', 'Verified'
    REJECTED = 'rejected', 'Rejected'
    IN_RESCUE = 'in_rescue', 'In Rescue'
    RESOLVED = 'resolved', 'Resolved'


class IncidentType(models.TextChoices):
    FIRE = 'fire', 'Fire'
    FLOOD = 'flood', 'Flood'
    LANDSLIDE = 'landslide', 'Landslide'
    ACCIDENT = 'accident', 'Accident'
    OTHER = 'other', 'Other'


class Severity(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'
    CRITICAL = 'critical', 'Critical'


# -------------------------------
#           INCIDENT
# -------------------------------

class Incident(models.Model):
    reporter = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reported_incidents'
    )

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    incident_type = models.CharField(
        max_length=50,
        choices=IncidentType.choices,
        default=IncidentType.OTHER
    )

    severity = models.CharField(
        max_length=20,
        choices=Severity.choices,
        default=Severity.LOW
    )

    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    status = models.CharField(
        max_length=30,
        choices=IncidentStatus.choices,
        default=IncidentStatus.REPORTED
    )

    metadata = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['incident_type']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"({self.get_incident_type_display()}) {self.title} - {self.reporter}"


# -------------------------------
#        INCIDENT MEDIA
# -------------------------------

class IncidentMedia(models.Model):
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='media'
    )
    file = models.FileField(upload_to='incident_media/%Y/%m/%d/')
    media_type = models.CharField(
        max_length=10,
        choices=[('photo', 'Photo'), ('video', 'Video')],
        default='photo'
    )
    uploaded_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Media for Incident {self.incident_id} ({self.media_type})"


# -------------------------------
#     INCIDENT VERIFICATION
# -------------------------------

class IncidentVerification(models.Model):
    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name='verifications'
    )
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='verifications_done'
    )

    status = models.CharField(
        max_length=20,
        choices=[
            ('approved', 'Approved'),
            ('rejected', 'Rejected'),
            ('duplicate', 'Duplicate')
        ]
    )

    remarks = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('incident', 'verified_by')

    def __str__(self):
        return f"Verification {self.status} by {self.verified_by} for {self.incident_id}"

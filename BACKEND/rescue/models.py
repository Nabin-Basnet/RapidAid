from django.db import models
from django.utils import timezone
from django.conf import settings

User = settings.AUTH_USER_MODEL


# -----------------------------------------------------
#                   ENUM TYPES
# -----------------------------------------------------

class TeamType(models.TextChoices):
    FIRE_BRIGADE = 'fire_brigade', 'Fire Brigade'
    LOCAL_VOLUNTEERS = 'local_volunteers', 'Local Volunteers'
    MEDICAL = 'medical', 'Medical Team'
    OTHER = 'other', 'Other'


class AssignmentStatus(models.TextChoices):
    ASSIGNED = 'assigned', 'Assigned'
    ON_ROUTE = 'on_route', 'On Route'
    ACTIVE = 'active', 'Active'
    COMPLETED = 'completed', 'Completed'


# -----------------------------------------------------
#                    RESCUE TEAM
# -----------------------------------------------------

class RescueTeam(models.Model):
    name = models.CharField(max_length=150)
    team_type = models.CharField(
        max_length=50,
        choices=TeamType.choices,
        default=TeamType.OTHER
    )
    contact_phone = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.name


# -----------------------------------------------------
#               RESCUE TEAM MEMBERS
# -----------------------------------------------------

class RescueTeamMember(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='rescue_memberships'
    )
    team = models.ForeignKey(
        RescueTeam,
        on_delete=models.CASCADE,
        related_name='members'
    )
    role = models.CharField(max_length=100, blank=True)  # e.g., leader, paramedic
    joined_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('user', 'team')

    def __str__(self):
        return f"{self.user} in {self.team}"


# -----------------------------------------------------
#               RESCUE ASSIGNMENT
# -----------------------------------------------------

class RescueAssignment(models.Model):
    incident = models.ForeignKey(
        'incidents.Incident',
        on_delete=models.CASCADE,
        related_name='assignments'
    )
    team = models.ForeignKey(
        RescueTeam,
        on_delete=models.SET_NULL,
        null=True,
        related_name='assignments'
    )

    assigned_at = models.DateTimeField(default=timezone.now)
    arrival_time = models.DateTimeField(null=True, blank=True)
    completion_time = models.DateTimeField(null=True, blank=True)

    status = models.CharField(
        max_length=20,
        choices=AssignmentStatus.choices,
        default=AssignmentStatus.ASSIGNED
    )

    notes = models.TextField(blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['-assigned_at'])
        ]

    def __str__(self):
        return (
            f"Assignment of {self.team} to Incident {self.incident_id} "
            f"({self.status})"
        )


# -----------------------------------------------------
#               RESCUE UPDATES
# -----------------------------------------------------

class RescueUpdate(models.Model):
    assignment = models.ForeignKey(
        RescueAssignment,
        on_delete=models.CASCADE,
        related_name='updates'
    )
    update_text = models.TextField()
    file_url = models.URLField(null=True, blank=True)
    status_update = models.CharField(max_length=50, blank=True)  # optional
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"Update for Assignment {self.assignment_id} at {self.created_at}"

from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db import transaction

from .models import VolunteerAssignment, VolunteerStatus
from .serializers import (
    VolunteerAssignmentSerializer,
    AdminVolunteerUpdateSerializer,
)
from Authapp.permissions import IsAdminRole
from incidents.models import IncidentStatus
from rescue.models import RescueTeam, RescueTeamMember, RescueAssignment
from RapidAid.email_utils import send_notification_email
from ledger.utils import create_ledger_entry


def _remove_from_incident_volunteer_team(assignment):
    RescueTeamMember.objects.filter(
        user=assignment.user,
        team__name=f"Volunteer Team - Incident {assignment.incident.id}",
    ).delete()


# =========================================
# APPLY AS VOLUNTEER (CITIZEN)
# =========================================
class ApplyVolunteerAPIView(generics.CreateAPIView):
    serializer_class = VolunteerAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        incident = serializer.validated_data["incident"]

        if not user.is_citizen:
            raise PermissionDenied("Only citizens can volunteer")

        if incident.status != IncidentStatus.VERIFIED:
            raise PermissionDenied("Incident not open for volunteering")

        # Check active volunteer work
        active = VolunteerAssignment.objects.filter(
            user=user,
            status__in=[
                VolunteerStatus.PENDING,
                VolunteerStatus.APPROVED,
                VolunteerStatus.SUSPENDED,
            ]
        ).exists()

        if active:
            raise PermissionDenied(
                "You are already volunteering in another incident"
            )

        assignment = serializer.save(user=user)
        create_ledger_entry(
            module="volunteer_assignments",
            reference_id=assignment.id,
            action="created",
            changed_by=user,
            new_data={
                "incident_id": assignment.incident_id,
                "status": assignment.status,
            },
            note="Volunteer application submitted.",
        )


# =========================================
# ADMIN: APPROVE / REJECT / SUSPEND VOLUNTEER
# =========================================
class AdminUpdateVolunteerAPIView(generics.UpdateAPIView):
    serializer_class = AdminVolunteerUpdateSerializer
    permission_classes = [IsAdminRole]
    queryset = VolunteerAssignment.objects.all()

    def get_serializer_class(self):
        if self.request.method in ["PUT", "PATCH"]:
            return AdminVolunteerUpdateSerializer
        return VolunteerAssignmentSerializer

    def perform_update(self, serializer):
        with transaction.atomic():
            assignment = self.get_object()
            previous_status = assignment.status
            status = serializer.validated_data.get("status")

            if status == VolunteerStatus.APPROVED:
                updated_assignment = serializer.save(approved_at=timezone.now())
                incident = updated_assignment.incident

                team, _ = RescueTeam.objects.get_or_create(
                    name=f"Volunteer Team - Incident {incident.id}",
                    defaults={
                        "organization": "RapidAid Volunteer Network",
                    },
                )

                RescueAssignment.objects.get_or_create(
                    incident=incident,
                    team=team,
                    defaults={
                        "status": "assigned",
                        "notes": "Auto-created from approved volunteer applications.",
                    },
                )

                RescueTeamMember.objects.get_or_create(
                    team=team,
                    user=updated_assignment.user,
                    defaults={"role": "Volunteer"},
                )

                if previous_status != VolunteerStatus.APPROVED:
                    send_notification_email(
                        to_email=updated_assignment.user.email,
                        subject="RapidAid: Volunteer Application Approved",
                        message=(
                            f"Hello {updated_assignment.user.full_name},\n\n"
                            f"Your volunteer application for incident '{incident.title}' has been approved.\n"
                            "Thank you for stepping up to help your community.\n\n"
                            "Regards,\nRapidAid Team"
                        ),
                    )
            elif status == VolunteerStatus.REJECTED:
                updated_assignment = serializer.save()
                _remove_from_incident_volunteer_team(updated_assignment)
                if previous_status != VolunteerStatus.REJECTED:
                    send_notification_email(
                        to_email=updated_assignment.user.email,
                        subject="RapidAid: Volunteer Application Update",
                        message=(
                            f"Hello {updated_assignment.user.full_name},\n\n"
                            f"Your volunteer application for incident '{updated_assignment.incident.title}' "
                            "was not approved at this time.\n"
                            "You can still support the platform by applying to future verified incidents.\n\n"
                            "Regards,\nRapidAid Team"
                        ),
                    )
            elif status == VolunteerStatus.SUSPENDED:
                updated_assignment = serializer.save()
                _remove_from_incident_volunteer_team(updated_assignment)
                if previous_status != VolunteerStatus.SUSPENDED:
                    send_notification_email(
                        to_email=updated_assignment.user.email,
                        subject="RapidAid: Volunteer Assignment Suspended",
                        message=(
                            f"Hello {updated_assignment.user.full_name},\n\n"
                            f"Your volunteer assignment for incident '{updated_assignment.incident.title}' "
                            "has been temporarily suspended by admin due to unusual activity.\n"
                            "Please contact the RapidAid admin team for clarification.\n\n"
                            "Regards,\nRapidAid Team"
                        ),
                    )
            elif status == VolunteerStatus.COMPLETED:
                serializer.save(completed_at=timezone.now())
            else:
                serializer.save()

            assignment.refresh_from_db()
            create_ledger_entry(
                module="volunteer_assignments",
                reference_id=assignment.id,
                action="updated",
                changed_by=self.request.user,
                old_data={"status": previous_status},
                new_data={"status": assignment.status},
                note="Volunteer assignment status updated.",
            )


# =========================================
# LIST VOLUNTEERS (PUBLIC)
# =========================================
class VolunteerListAPIView(generics.ListAPIView):
    serializer_class = VolunteerAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = VolunteerAssignment.objects.all().order_by("-applied_at")

from django.contrib import admin
from django.db import transaction
from django.utils import timezone

from .models import VolunteerAssignment, VolunteerStatus
from rescue.models import RescueTeam, RescueTeamMember, RescueAssignment
from RapidAid.email_utils import send_notification_email


@admin.register(VolunteerAssignment)
class VolunteerAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "user",
        "incident",
        "status",
        "applied_at",
        "approved_at",
        "completed_at",
    )

    list_filter = ("status", "incident")
    search_fields = (
        "user__email",
        "user__full_name",
        "incident__title",
    )

    readonly_fields = ("applied_at",)

    ordering = ("-applied_at",)

    def save_model(self, request, obj, form, change):
        previous_status = None
        if change and obj.pk:
            previous = VolunteerAssignment.objects.get(pk=obj.pk)
            previous_status = previous.status

        with transaction.atomic():
            if obj.status == VolunteerStatus.APPROVED and not obj.approved_at:
                obj.approved_at = timezone.now()
            if obj.status == VolunteerStatus.COMPLETED and not obj.completed_at:
                obj.completed_at = timezone.now()

            super().save_model(request, obj, form, change)

            if obj.status == VolunteerStatus.APPROVED:
                team, _ = RescueTeam.objects.get_or_create(
                    name=f"Volunteer Team - Incident {obj.incident.id}",
                    defaults={"organization": "RapidAid Volunteer Network"},
                )

                RescueAssignment.objects.get_or_create(
                    incident=obj.incident,
                    team=team,
                    defaults={
                        "status": "assigned",
                        "notes": "Auto-created from approved volunteer applications.",
                    },
                )

                RescueTeamMember.objects.get_or_create(
                    team=team,
                    user=obj.user,
                    defaults={"role": "Volunteer"},
                )

            if previous_status != obj.status:
                if obj.status == VolunteerStatus.APPROVED:
                    send_notification_email(
                        to_email=obj.user.email,
                        subject="RapidAid: Volunteer Application Approved",
                        message=(
                            f"Hello {obj.user.full_name},\n\n"
                            f"Your volunteer application for incident '{obj.incident.title}' has been approved.\n"
                            "Thank you for stepping up to help your community.\n\n"
                            "Regards,\nRapidAid Team"
                        ),
                    )
                elif obj.status == VolunteerStatus.REJECTED:
                    send_notification_email(
                        to_email=obj.user.email,
                        subject="RapidAid: Volunteer Application Update",
                        message=(
                            f"Hello {obj.user.full_name},\n\n"
                            f"Your volunteer application for incident '{obj.incident.title}' was not approved at this time.\n"
                            "You can still support the platform by applying to future verified incidents.\n\n"
                            "Regards,\nRapidAid Team"
                        ),
                    )

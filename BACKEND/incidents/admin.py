from django.contrib import admin
from django.utils import timezone

from .models import Incident, IncidentMedia, IncidentTimeline, IncidentStatus
from RapidAid.email_utils import send_notification_email


@admin.register(Incident)
class IncidentAdmin(admin.ModelAdmin):
    list_display = ("title", "status", "reporter", "created_at", "approved_at")
    list_filter = ("status", "incident_type", "severity")
    search_fields = ("title", "description", "reporter__email", "location")
    readonly_fields = ("created_at", "updated_at", "approved_at")

    def save_model(self, request, obj, form, change):
        previous_status = None
        if change and obj.pk:
            previous = Incident.objects.get(pk=obj.pk)
            previous_status = previous.status

        if obj.status == IncidentStatus.VERIFIED and not obj.approved_at:
            obj.approved_at = timezone.now()
            obj.approved_by = request.user

        super().save_model(request, obj, form, change)

        if previous_status != obj.status:
            IncidentTimeline.objects.create(
                incident=obj,
                title=f"Incident {obj.status.replace('_', ' ').title()}",
                description=f"Status updated to {obj.status}",
                created_by=request.user,
            )

        if (
            previous_status != IncidentStatus.VERIFIED
            and obj.status == IncidentStatus.VERIFIED
            and obj.reporter_id
        ):
            send_notification_email(
                to_email=obj.reporter.email,
                subject="RapidAid: Incident Approved",
                message=(
                    f"Hello {obj.reporter.full_name},\n\n"
                    f"Your incident '{obj.title}' has been approved and marked as verified.\n"
                    "You can now open RapidAid to track updates and community support.\n\n"
                    "Thank you,\nRapidAid Team"
                ),
            )


admin.site.register(IncidentMedia)
admin.site.register(IncidentTimeline)

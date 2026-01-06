from django.contrib import admin
from .models import VolunteerAssignment


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

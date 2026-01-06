from django.urls import path
from .views import (
    ReportIncidentAPIView,
    IncidentMediaUploadAPIView,
    IncidentListAPIView,
    IncidentDetailAPIView,
    IncidentAdminUpdateAPIView,
)

urlpatterns = [
    # ----------------------------------------
    # Citizen reports an incident
    # ----------------------------------------
    path("report/", ReportIncidentAPIView.as_view(), name="report-incident"),

    # ----------------------------------------
    # Upload media for a specific incident
    # ----------------------------------------
    path(
        "media/upload/<int:incident_id>/",
        IncidentMediaUploadAPIView.as_view(),
        name="incident-media-upload"
    ),

    # ----------------------------------------
    # List of incidents (all approved/reported)
    # ----------------------------------------
    path("", IncidentListAPIView.as_view(), name="incident-list"),

    # ----------------------------------------
    # Incident detail
    # ----------------------------------------
    path("<int:pk>/", IncidentDetailAPIView.as_view(), name="incident-detail"),

    # ----------------------------------------
    # Admin: update incident (verify, progress, close)
    # ----------------------------------------
    path(
        "admin/<int:pk>/update/",
        IncidentAdminUpdateAPIView.as_view(),
        name="admin-incident-update"
    ),
]

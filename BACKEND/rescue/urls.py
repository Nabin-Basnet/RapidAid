from django.urls import path
from .views import (
    CreateRescueTeamAPIView,
    AddRescueTeamMemberAPIView,
    AssignRescueTeamAPIView,
    RescueAssignmentListAPIView,
    UpdateRescueStatusAPIView,
)

urlpatterns = [
    path("teams/create/", CreateRescueTeamAPIView.as_view()),
    path("teams/members/add/", AddRescueTeamMemberAPIView.as_view()),

    path("assign/", AssignRescueTeamAPIView.as_view()),
    path("assignments/", RescueAssignmentListAPIView.as_view()),
    path("assignments/<int:pk>/update/", UpdateRescueStatusAPIView.as_view()),
]

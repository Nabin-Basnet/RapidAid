from django.urls import path
from .views import (
    CreateRescueTeamAPIView,
    AddRescueTeamMemberAPIView,
    RescueTeamListAPIView,
    AssignRescueTeamAPIView,
    RescueAssignmentListAPIView,
    UpdateRescueStatusAPIView,
    DeleteRescueTeamAPIView,
    RemoveRescueTeamMemberAPIView,
)

urlpatterns = [
    path("teams/", RescueTeamListAPIView.as_view()),
    path("teams/create/", CreateRescueTeamAPIView.as_view()),
    path("teams/<int:pk>/delete/", DeleteRescueTeamAPIView.as_view()),
    path("teams/members/add/", AddRescueTeamMemberAPIView.as_view()),
    path("teams/members/<int:pk>/delete/", RemoveRescueTeamMemberAPIView.as_view()),

    path("assign/", AssignRescueTeamAPIView.as_view()),
    path("assignments/", RescueAssignmentListAPIView.as_view()),
    path("assignments/<int:pk>/update/", UpdateRescueStatusAPIView.as_view()),
]

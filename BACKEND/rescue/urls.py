from rest_framework.routers import DefaultRouter
from django.urls import path, include

from .views import (
    RescueTeamViewSet,
    RescueTeamMemberViewSet,
    RescueAssignmentViewSet,
    RescueUpdateViewSet
)

router = DefaultRouter()
router.register(r"rescue-teams", RescueTeamViewSet)
router.register(r"rescue-team-members", RescueTeamMemberViewSet)
router.register(r"rescue-assignments", RescueAssignmentViewSet)
router.register(r"rescue-updates", RescueUpdateViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

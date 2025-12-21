from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import (
    RescueTeam,
    RescueTeamMember,
    RescueAssignment,
    RescueUpdate
)
from .serializers import (
    RescueTeamSerializer,
    RescueTeamMemberSerializer,
    RescueAssignmentSerializer,
    RescueUpdateSerializer
)


# ----------------------------------
# Rescue Team API
# ----------------------------------
class RescueTeamViewSet(viewsets.ModelViewSet):
    queryset = RescueTeam.objects.all()
    serializer_class = RescueTeamSerializer
    permission_classes = [permissions.IsAuthenticated]


# ----------------------------------
# Rescue Team Member API
# ----------------------------------
class RescueTeamMemberViewSet(viewsets.ModelViewSet):
    queryset = RescueTeamMember.objects.select_related("user", "team")
    serializer_class = RescueTeamMemberSerializer
    permission_classes = [permissions.IsAuthenticated]


# ----------------------------------
# Rescue Assignment API
# ----------------------------------
class RescueAssignmentViewSet(viewsets.ModelViewSet):
    queryset = RescueAssignment.objects.select_related("team", "incident")
    serializer_class = RescueAssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=["post"])
    def mark_completed(self, request, pk=None):
        assignment = self.get_object()
        assignment.status = "completed"
        assignment.completion_time = timezone.now()
        assignment.save()
        return Response(
            {"message": "Assignment marked as completed"},
            status=status.HTTP_200_OK
        )


# ----------------------------------
# Rescue Update API
# ----------------------------------
class RescueUpdateViewSet(viewsets.ModelViewSet):
    queryset = RescueUpdate.objects.select_related("assignment")
    serializer_class = RescueUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

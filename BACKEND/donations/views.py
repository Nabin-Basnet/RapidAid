from rest_framework import generics, permissions
from rest_framework.exceptions import PermissionDenied

from .models import Donor, Donation
from .serializers import DonorSerializer, DonationSerializer
from incidents.models import IncidentStatus


# ==================================
# CREATE DONOR PROFILE
# ==================================
class CreateDonorAPIView(generics.CreateAPIView):
    serializer_class = DonorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if hasattr(user, "donor_profile"):
            raise PermissionDenied("Donor profile already exists")

        serializer.save(user=user)


# ==================================
# MAKE DONATION
# ==================================
class CreateDonationAPIView(generics.CreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if not hasattr(user, "donor_profile"):
            raise PermissionDenied("Create donor profile first")

        incident = serializer.validated_data["incident"]

        if incident.status == IncidentStatus.RESOLVED:
            raise PermissionDenied("Donations closed for this incident")

        serializer.save(donor=user.donor_profile)


# ==================================
# LIST DONATIONS (PUBLIC)
# ==================================
class DonationListAPIView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Donation.objects.all().order_by("-created_at")

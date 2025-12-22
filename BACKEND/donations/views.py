from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework import status

from .models import Donor, Donation, DonationDistribution
from .serializers import (
    DonorSerializer,
    DonationSerializer,
    DonationDistributionSerializer
)


# --------------------------------------------------
#                   DONOR API
# --------------------------------------------------
class DonorViewSet(viewsets.ModelViewSet):
    queryset = Donor.objects.select_related("user")
    serializer_class = DonorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# --------------------------------------------------
#                  DONATION API
# --------------------------------------------------
class DonationViewSet(viewsets.ModelViewSet):
    queryset = Donation.objects.select_related(
        "donor", "incident", "family"
    )
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]


# --------------------------------------------------
#           DONATION DISTRIBUTION API
# --------------------------------------------------
class DonationDistributionViewSet(viewsets.ModelViewSet):
    queryset = DonationDistribution.objects.select_related(
        "donation", "family", "distributed_by"
    )
    serializer_class = DonationDistributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(distributed_by=self.request.user)

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DonorViewSet,
    DonationViewSet,
    DonationDistributionViewSet
)

router = DefaultRouter()
router.register(r"donors", DonorViewSet)
router.register(r"donations", DonationViewSet)
router.register(r"donation-distributions", DonationDistributionViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

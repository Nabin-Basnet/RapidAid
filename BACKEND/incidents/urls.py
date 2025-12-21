from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    IncidentViewSet,
    IncidentMediaViewSet,
    IncidentVerificationViewSet
)
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
)

router = DefaultRouter()
router.register(r"incidents", IncidentViewSet)
router.register(r"incident-media", IncidentMediaViewSet)
router.register(r"incident-verifications", IncidentVerificationViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    DamageAssessmentViewSet,
    AffectedFamilyViewSet
)

router = DefaultRouter()
router.register(r"damage-assessments", DamageAssessmentViewSet)
router.register(r"affected-families", AffectedFamilyViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

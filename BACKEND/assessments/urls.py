from django.urls import path
from .views import (
    AddAffectedFamilyAPIView,
    AffectedFamilyListAPIView,
    LossAssessmentAPIView,
    LossAssessmentDetailAPIView,
)

urlpatterns = [
    # Affected families
    path("families/add/", AddAffectedFamilyAPIView.as_view(), name="add-family"),
    path("families/", AffectedFamilyListAPIView.as_view(), name="family-list"),

    # Loss assessment
    path("loss/add/", LossAssessmentAPIView.as_view(), name="loss-add"),
    path("loss/<int:pk>/", LossAssessmentDetailAPIView.as_view(), name="loss-detail"),
]

from django.urls import path
from .views import (
    ApplyVolunteerAPIView,
    AdminUpdateVolunteerAPIView,
    VolunteerListAPIView,
)

urlpatterns = [
    path("apply/", ApplyVolunteerAPIView.as_view()),
    path("list/", VolunteerListAPIView.as_view()),
    path("update/<int:pk>/", AdminUpdateVolunteerAPIView.as_view()),
]

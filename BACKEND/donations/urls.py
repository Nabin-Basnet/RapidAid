from django.urls import path
from .views import (
    CreateDonorAPIView,
    CreateDonationAPIView,
    DonationListAPIView,
)

urlpatterns = [
    path("donor/create/", CreateDonorAPIView.as_view()),
    path("donate/", CreateDonationAPIView.as_view()),
    path("list/", DonationListAPIView.as_view()),
]

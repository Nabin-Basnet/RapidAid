from django.urls import path
from .views import (
    CreateDonorAPIView,
    DonorMeAPIView,
    CreateDonationAPIView,
    DonationListAPIView,
)

urlpatterns = [
    path("donor/me/", DonorMeAPIView.as_view()),
    path("donor/create/", CreateDonorAPIView.as_view()),
    path("donate/", CreateDonationAPIView.as_view()),
    path("list/", DonationListAPIView.as_view()),
]

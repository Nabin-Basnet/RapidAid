from django.urls import path
from .views import (
    CreateDonorAPIView,
    DonorMeAPIView,
    CreateDonationAPIView,
    DonationListAPIView,
    MyDonationListAPIView,
    KhaltiInitiateDonationAPIView,
    KhaltiVerifyDonationAPIView,
)

urlpatterns = [
    path("donor/me/", DonorMeAPIView.as_view()),
    path("donor/create/", CreateDonorAPIView.as_view()),
    path("donate/", CreateDonationAPIView.as_view()),
    path("khalti/initiate/", KhaltiInitiateDonationAPIView.as_view()),
    path("khalti/verify/", KhaltiVerifyDonationAPIView.as_view()),
    path("my/", MyDonationListAPIView.as_view()),
    path("list/", DonationListAPIView.as_view()),
]

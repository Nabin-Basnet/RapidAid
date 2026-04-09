from django.urls import path
from .views import (
    CreateDonorAPIView,
    DonorMeAPIView,
    CreateDonationAPIView,
    DonationListAPIView,
    MyDonationListAPIView,
    VerifyKhaltiPaymentAPIView,
)

urlpatterns = [
    path("donor/me/", DonorMeAPIView.as_view()),
    path("donor/create/", CreateDonorAPIView.as_view()),
    path("donate/", CreateDonationAPIView.as_view()),
    path("verify-khalti/", VerifyKhaltiPaymentAPIView.as_view()),
    path("my/", MyDonationListAPIView.as_view()),
    path("list/", DonationListAPIView.as_view()),
]

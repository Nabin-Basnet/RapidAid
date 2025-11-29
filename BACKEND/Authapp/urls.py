from django.urls import path
from .views import (
    RegisterUserAPIView,
    LoginAPIView,
    UserMeAPIView,
    UpdateProfileAPIView,
    AdminUserListAPIView,
    AdminUserDetailAPIView
)

urlpatterns = [
    path("register/", RegisterUserAPIView.as_view()),
    path("login/", LoginAPIView.as_view()),

    path("me/", UserMeAPIView.as_view()),
    path("me/update/", UpdateProfileAPIView.as_view()),

    # Admin endpoints
    path("admin/all/", AdminUserListAPIView.as_view()),
    path("admin/<int:pk>/", AdminUserDetailAPIView.as_view()),
]

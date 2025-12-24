from django.urls import path
from .views import (
    RegisterUserAPIView,
    LoginAPIView,
    UserMeAPIView,
    UpdateProfileAPIView,
    AdminUserListAPIView,
    AdminUserDetailAPIView,
    ProfileAPIView,  # NEW
)

urlpatterns = [
    # Public / Auth endpoints
    path("register/", RegisterUserAPIView.as_view(), name="register"),
    path("login/", LoginAPIView.as_view(), name="login"),

    # Authenticated user endpoints
    path("me/", UserMeAPIView.as_view(), name="user-me"),
    path("me/update/", UpdateProfileAPIView.as_view(), name="update-profile"),
    path("profile/", ProfileAPIView.as_view(), name="profile"),  # NEW: aggregated profile

    # Admin endpoints
    path("admin/all/", AdminUserListAPIView.as_view(), name="admin-user-list"),
    path("admin/<int:pk>/", AdminUserDetailAPIView.as_view(), name="admin-user-detail"),
]

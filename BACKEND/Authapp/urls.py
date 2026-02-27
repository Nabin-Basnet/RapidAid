from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterUserAPIView,
    LoginAPIView,
    LogoutAPIView,
    UserMeAPIView,
    UpdateProfileAPIView,
    AdminUserListAPIView,
    AdminCreateUserAPIView,
    AdminUserDetailAPIView,
    UserProfileSummaryAPIView,
    PasswordResetRequestAPIView,
    PasswordResetConfirmAPIView,
)

urlpatterns = [
    path("register/", RegisterUserAPIView.as_view()),
    path("login/", LoginAPIView.as_view()),
    path("token/refresh/", TokenRefreshView.as_view()),
    path("logout/", LogoutAPIView.as_view()),
    path("password-reset/request/", PasswordResetRequestAPIView.as_view()),
    path("password-reset/confirm/", PasswordResetConfirmAPIView.as_view()),
    path("me/", UserMeAPIView.as_view()),
    path("profile/", UserProfileSummaryAPIView.as_view()),
    path("me/update/", UpdateProfileAPIView.as_view()),

    # Admin
    path("admin/create-user/", AdminCreateUserAPIView.as_view()),
    path("admin/users/", AdminUserListAPIView.as_view()),
    path("admin/users/<int:pk>/", AdminUserDetailAPIView.as_view()),
]

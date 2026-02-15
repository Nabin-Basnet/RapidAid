from django.urls import path
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
)

urlpatterns = [
    path("register/", RegisterUserAPIView.as_view()),
    path("login/", LoginAPIView.as_view()),
    path("logout/", LogoutAPIView.as_view()),
    path("me/", UserMeAPIView.as_view()),
    path("profile/", UserProfileSummaryAPIView.as_view()),
    path("me/update/", UpdateProfileAPIView.as_view()),

    # Admin
    path("admin/create-user/", AdminCreateUserAPIView.as_view()),
    path("admin/users/", AdminUserListAPIView.as_view()),
    path("admin/users/<int:pk>/", AdminUserDetailAPIView.as_view()),
]

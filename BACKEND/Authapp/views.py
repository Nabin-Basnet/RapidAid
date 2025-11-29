from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserDetailSerializer
from .models import UserRole

User = get_user_model()


# -----------------------------------------------------------
# REGISTER USER API
# -----------------------------------------------------------
class RegisterUserAPIView(generics.CreateAPIView):
    """
    Register a new user (default role: citizen)
    """
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        password = self.request.data.get("password")
        user = serializer.save()
        user.set_password(password)
        user.save()


# -----------------------------------------------------------
# LOGIN API (JWT TOKEN)
# -----------------------------------------------------------
class LoginAPIView(generics.GenericAPIView):
    """
    Login user with email + password
    Returns access & refresh tokens and user info
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")

        user = User.objects.filter(email=email).first()

        if user is None or not user.check_password(password):
            return Response(
                {"detail": "Invalid email or password"},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response({
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserDetailSerializer(user).data,
        })


# -----------------------------------------------------------
# GET MY PROFILE (AUTHENTICATED USER)
# -----------------------------------------------------------
class UserMeAPIView(generics.RetrieveAPIView):
    """
    Return the authenticated user's detail
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# -----------------------------------------------------------
# UPDATE MY PROFILE
# -----------------------------------------------------------
class UpdateProfileAPIView(generics.UpdateAPIView):
    """
    Update authenticated user's profile
    Supports updating password, fullname, phone, etc.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        password = self.request.data.get("password")
        user = serializer.save()

        if password:
            user.set_password(password)
            user.save()


# -----------------------------------------------------------
# ADMIN — LIST ALL USERS
# -----------------------------------------------------------
class AdminUserListAPIView(generics.ListAPIView):
    """
    Admin: List all users
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAdminUser]

    queryset = User.objects.all().order_by("-id")


# -----------------------------------------------------------
# ADMIN — RETRIEVE ANY USER
# -----------------------------------------------------------
class AdminUserDetailAPIView(generics.RetrieveAPIView):
    """
    Admin: Retrieve a specific user by ID
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAdminUser]

    queryset = User.objects.all()

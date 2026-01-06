from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import UserRole
from .serializers import UserDetailSerializer
from .permissions import IsAdminRole

User = get_user_model()


# ============================================================
# REGISTER USER (CITIZEN ONLY)
# ============================================================
class RegisterUserAPIView(generics.CreateAPIView):
    """
    Public registration.
    Always creates a CITIZEN user.
    """
    queryset = User.objects.all()
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.AllowAny]

    def perform_create(self, serializer):
        user = serializer.save(role=UserRole.CITIZEN)
        password = self.request.data.get("password")
        if password:
            user.set_password(password)
            user.save()


# ============================================================
# LOGIN / LOGOUT (JWT)
# ============================================================

# Serializer for login
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


# Login API
class LoginAPIView(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        user = User.objects.filter(email=email).first()
        if not user or not user.check_password(password):
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


# Serializer for logout
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()


# Logout API
class LogoutAPIView(generics.GenericAPIView):
    serializer_class = LogoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        refresh_token = serializer.validated_data["refresh"]
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully"})
        except Exception:
            return Response(
                {"detail": "Invalid or expired token"},
                status=status.HTTP_400_BAD_REQUEST
            )


# ============================================================
# CURRENT USER PROFILE
# ============================================================
class UserMeAPIView(generics.RetrieveAPIView):
    """
    Get logged-in user's details.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# ============================================================
# UPDATE CURRENT USER PROFILE
# ============================================================
class UpdateProfileAPIView(generics.UpdateAPIView):
    """
    Update logged-in user's profile.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def perform_update(self, serializer):
        user = serializer.save()
        password = self.request.data.get("password")
        if password:
            user.set_password(password)
            user.save()


# ============================================================
# ADMIN: CREATE USER (ADMIN / RESCUE / ASSESSMENT)
# ============================================================
class AdminCreateUserAPIView(generics.CreateAPIView):
    """
    Admin creates:
    - Admin
    - Rescue Team user
    - Assessment Team user
    """
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminRole]

    def perform_create(self, serializer):
        role = self.request.data.get("role")

        if not role:
            raise ValidationError({"role": "This field is required."})

        if role not in UserRole.values:
            raise ValidationError({"role": "Invalid role"})

        user = serializer.save(role=role)



# ============================================================
# ADMIN: LIST ALL USERS
# ============================================================
class AdminUserListAPIView(generics.ListAPIView):
    """
    Admin can view all users.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.all().order_by("-id")


# ============================================================
# ADMIN: USER DETAIL
# ============================================================
class AdminUserDetailAPIView(generics.RetrieveAPIView):
    """
    Admin can view a specific user.
    """
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminRole]
    queryset = User.objects.all()

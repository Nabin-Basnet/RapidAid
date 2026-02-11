from rest_framework import generics, permissions, serializers, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Sum

from incidents.models import Incident
from donations.models import Donation
from volunteer.models import VolunteerAssignment
from rescue.models import RescueTeamMember, RescueAssignment

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
# CURRENT USER PROFILE SUMMARY
# ============================================================
class UserProfileSummaryAPIView(generics.GenericAPIView):
    """
    Get logged-in user's profile summary with activity data.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        incident_qs = Incident.objects.filter(reporter=user).order_by("-created_at")
        donation_qs = Donation.objects.filter(donor__user=user).order_by("-created_at")
        volunteer_qs = VolunteerAssignment.objects.filter(user=user).order_by("-applied_at")

        team_ids = RescueTeamMember.objects.filter(user=user).values_list("team_id", flat=True)
        rescue_assignments_qs = RescueAssignment.objects.filter(team_id__in=team_ids)

        total_money = donation_qs.filter(donation_type="money").aggregate(total=Sum("amount"))["total"]

        recent_incidents = list(
            incident_qs.values("id", "title", "incident_type", "status", "created_at")[:5]
        )

        recent_donations = [
            {
                "id": donation.id,
                "donation_type": donation.donation_type,
                "amount": donation.amount,
                "item_name": donation.item_name,
                "quantity": donation.quantity,
                "created_at": donation.created_at,
                "incident_title": donation.incident.title if donation.incident else None,
            }
            for donation in donation_qs.select_related("incident")[:5]
        ]

        recent_volunteer = [
            {
                "id": assignment.id,
                "status": assignment.status,
                "applied_at": assignment.applied_at,
                "incident_title": assignment.incident.title if assignment.incident else None,
            }
            for assignment in volunteer_qs.select_related("incident")[:5]
        ]

        data = {
            "user": UserDetailSerializer(user).data,
            "incident_activity": {
                "total_reported": incident_qs.count(),
            },
            "donation_activity": {
                "total_money_donated": float(total_money or 0),
                "total_donations": donation_qs.count(),
            },
            "rescue_activity": {
                "total_assignments": rescue_assignments_qs.count(),
            },
            "volunteer_activity": {
                "total_assignments": volunteer_qs.count(),
            },
            "recent_incidents": recent_incidents,
            "recent_donations": recent_donations,
            "recent_volunteer": recent_volunteer,
        }

        return Response(data)


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

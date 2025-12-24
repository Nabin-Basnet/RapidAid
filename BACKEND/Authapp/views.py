from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum

from .serializers import UserDetailSerializer
from incidents.models import Incident
from rescue.models import RescueAssignment, RescueTeamMember
from donations.models import Donor, Donation

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
# GET CURRENT USER PROFILE
# -----------------------------------------------------------
class UserMeAPIView(generics.RetrieveAPIView):
    """
    Return the authenticated user's basic details
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


# -----------------------------------------------------------
# UPDATE CURRENT USER PROFILE
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
# ADMIN: LIST ALL USERS
# -----------------------------------------------------------
class AdminUserListAPIView(generics.ListAPIView):
    """
    Admin: List all users
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAdminUser]

    queryset = User.objects.all().order_by("-id")


# -----------------------------------------------------------
# ADMIN: RETRIEVE ANY USER
# -----------------------------------------------------------
class AdminUserDetailAPIView(generics.RetrieveAPIView):
    """
    Admin: Retrieve a specific user by ID
    """
    serializer_class = UserDetailSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = User.objects.all()


# -----------------------------------------------------------
# PROFILE API (Aggregated Data)
# -----------------------------------------------------------
class ProfileAPIView(APIView):
    """
    Aggregates user info + activity across incidents, rescue, and donations
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # --- Basic user data ---
        user_data = UserDetailSerializer(user).data

        # --- Incident activity ---
        incidents = Incident.objects.filter(reporter=user)
        incident_stats = {
            "total_reported": incidents.count(),
            "verified": incidents.filter(status="verified").count(),
            "in_rescue": incidents.filter(status="in_rescue").count(),
            "resolved": incidents.filter(status="resolved").count(),
        }
        recent_incidents = incidents.order_by("-created_at")[:5].values(
            "id", "title", "status", "incident_type", "created_at"
        )

        # --- Rescue activity ---
        rescue_assignments = RescueAssignment.objects.filter(
            team__members__user=user
        ).distinct()
        rescue_stats = {
            "total_assignments": rescue_assignments.count(),
            "completed": rescue_assignments.filter(status="completed").count(),
            "active": rescue_assignments.filter(status="active").count(),
        }

        # --- Donation activity ---
        donor = Donor.objects.filter(user=user).first()
        donation_stats = {}
        recent_donations = []
        if donor:
            donations = Donation.objects.filter(donor=donor)
            donation_stats = {
                "total_donations": donations.count(),
                "total_money_donated": donations.filter(
                    donation_type="money"
                ).aggregate(total=Sum("amount"))["total"] or 0,
                "items_donated": donations.filter(donation_type="item").count(),
            }
            recent_donations = donations.order_by("-created_at")[:5].values(
                "donation_type", "amount", "item_description", "created_at"
            )

        # --- Final response ---
        return Response({
            "user": user_data,
            "incident_activity": incident_stats,
            "recent_incidents": list(recent_incidents),
            "rescue_activity": rescue_stats,
            "donation_activity": donation_stats,
            "recent_donations": list(recent_donations),
        })

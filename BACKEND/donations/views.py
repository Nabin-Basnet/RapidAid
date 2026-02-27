import json
from decimal import Decimal, InvalidOperation
from urllib import error as urlerror
from urllib import request as urlrequest

from django.conf import settings
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Donor, Donation
from .serializers import DonorSerializer, DonationSerializer
from incidents.models import Incident, IncidentStatus
from ledger.utils import create_ledger_entry


# ==================================
# CREATE DONOR PROFILE
# ==================================
class CreateDonorAPIView(generics.CreateAPIView):
    serializer_class = DonorSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if hasattr(user, "donor_profile"):
            raise PermissionDenied("Donor profile already exists")

        donor = serializer.save(user=user)
        create_ledger_entry(
            module="donors",
            reference_id=donor.id,
            action="created",
            changed_by=user,
            new_data={"user_id": user.id},
            note="Donor profile created.",
        )


# ==================================
# CURRENT USER DONOR PROFILE STATUS
# ==================================
class DonorMeAPIView(generics.GenericAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if hasattr(user, "donor_profile"):
            donor = user.donor_profile
            return Response({
                "has_donor": True,
                "donor": DonorSerializer(donor).data,
            })

        return Response({
            "has_donor": False,
            "donor": None,
        })


# ==================================
# MAKE DONATION
# ==================================
class CreateDonationAPIView(generics.CreateAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user

        if not hasattr(user, "donor_profile"):
            raise PermissionDenied("Create donor profile first")

        incident = serializer.validated_data["incident"]
        donation_type = serializer.validated_data["donation_type"]

        if incident.status == IncidentStatus.RESOLVED:
            raise PermissionDenied("Donations closed for this incident")
        if donation_type == "money":
            raise PermissionDenied("Use Khalti payment endpoint for monetary donations")

        donation = serializer.save(donor=user.donor_profile)
        create_ledger_entry(
            module="donations",
            reference_id=donation.id,
            action="created",
            changed_by=user,
            new_data={
                "incident_id": donation.incident_id,
                "donation_type": donation.donation_type,
                "amount": str(donation.amount) if donation.amount is not None else None,
                "item_name": donation.item_name,
                "quantity": donation.quantity,
            },
            note="Donation submitted.",
        )


# ==================================
# LIST DONATIONS (PUBLIC)
# ==================================
class DonationListAPIView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Donation.objects.filter(
            Q(donation_type="item") |
            Q(donation_type="money", payment_status="paid")
        ).order_by("-created_at")


class MyDonationListAPIView(generics.ListAPIView):
    serializer_class = DonationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if not hasattr(user, "donor_profile"):
            return Donation.objects.none()

        return Donation.objects.filter(
            donor=user.donor_profile
        ).order_by("-created_at")


def _khalti_post(path, payload):
    url = f"{settings.KHALTI_API_BASE_URL.rstrip('/')}/{path.lstrip('/')}"
    req = urlrequest.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    with urlrequest.urlopen(req, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def _validate_khalti_config():
    secret_key = (settings.KHALTI_SECRET_KEY or "").strip()
    if not secret_key:
        return "Khalti secret key is not configured"

    # ePayment merchant keys are issued in this format.
    if not secret_key.startswith("live_secret_key_"):
        return (
            "Invalid Khalti secret key format. Use Merchant Dashboard ePayment "
            "Live secret key and match it with the correct base URL."
        )

    return None


def _extract_http_error_detail(exc, fallback):
    try:
        body = exc.read().decode("utf-8")
    except Exception:
        return fallback

    try:
        payload = json.loads(body)
    except Exception:
        return body or fallback

    if isinstance(payload, dict):
        detail = payload.get("detail")
        if isinstance(detail, str) and detail.strip():
            return detail

        # Khalti may return field-wise validation errors.
        messages = []
        for key, value in payload.items():
            if key == "detail":
                continue
            if isinstance(value, list):
                rendered = ", ".join(str(item) for item in value if str(item).strip())
                if rendered:
                    messages.append(f"{key}: {rendered}")
            elif isinstance(value, str) and value.strip():
                messages.append(f"{key}: {value}")
        if messages:
            return "; ".join(messages)

    return body or fallback


class KhaltiInitiateDonationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        config_error = _validate_khalti_config()
        if config_error:
            return Response(
                {"detail": config_error},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        user = request.user
        if not hasattr(user, "donor_profile"):
            raise PermissionDenied("Create donor profile first")

        incident_id = request.data.get("incident")
        raw_amount = request.data.get("amount")
        is_anonymous = bool(request.data.get("is_anonymous", False))

        if not incident_id:
            return Response({"detail": "incident is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            incident = Incident.objects.get(pk=incident_id)
        except Incident.DoesNotExist:
            return Response({"detail": "Incident not found"}, status=status.HTTP_404_NOT_FOUND)

        if incident.status == IncidentStatus.RESOLVED:
            return Response({"detail": "Donations closed for this incident"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            amount_decimal = Decimal(str(raw_amount))
        except (TypeError, InvalidOperation):
            return Response({"detail": "Invalid amount"}, status=status.HTTP_400_BAD_REQUEST)

        if amount_decimal <= 0:
            return Response({"detail": "Amount must be greater than 0"}, status=status.HTTP_400_BAD_REQUEST)

        amount_paisa = int(amount_decimal * 100)
        if amount_paisa < 1000:
            return Response(
                {"detail": "Minimum Khalti amount is NPR 10"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        donation = Donation.objects.create(
            donor=user.donor_profile,
            incident=incident,
            donation_type="money",
            amount=amount_decimal,
            is_anonymous=is_anonymous,
            payment_status="pending",
        )

        payload = {
            "return_url": settings.KHALTI_RETURN_URL,
            "website_url": settings.KHALTI_WEBSITE_URL,
            "amount": amount_paisa,
            "purchase_order_id": f"donation-{donation.id}",
            "purchase_order_name": f"Donation for incident {incident.id}",
            "customer_info": {
                "name": user.full_name or user.email,
                "email": user.email,
            },
        }

        try:
            khalti_response = _khalti_post("/epayment/initiate/", payload)
        except urlerror.HTTPError as exc:
            donation.payment_status = "failed"
            donation.save(update_fields=["payment_status"])
            message = _extract_http_error_detail(exc, "Khalti initiate failed")
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            donation.payment_status = "failed"
            donation.save(update_fields=["payment_status"])
            return Response(
                {"detail": "Could not connect to Khalti"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        donation.khalti_pidx = khalti_response.get("pidx")
        donation.save(update_fields=["khalti_pidx"])

        create_ledger_entry(
            module="donations",
            reference_id=donation.id,
            action="created",
            changed_by=user,
            new_data={
                "incident_id": donation.incident_id,
                "donation_type": "money",
                "amount": str(donation.amount),
                "payment_status": donation.payment_status,
                "khalti_pidx": donation.khalti_pidx,
            },
            note="Khalti payment initiated for donation.",
        )

        return Response(
            {
                "donation_id": donation.id,
                "pidx": khalti_response.get("pidx"),
                "payment_url": khalti_response.get("payment_url"),
                "expires_at": khalti_response.get("expires_at"),
                "expires_in": khalti_response.get("expires_in"),
            },
            status=status.HTTP_200_OK,
        )


class KhaltiVerifyDonationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        config_error = _validate_khalti_config()
        if config_error:
            return Response(
                {"detail": config_error},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        pidx = request.data.get("pidx")
        if not pidx:
            return Response({"detail": "pidx is required"}, status=status.HTTP_400_BAD_REQUEST)

        if not hasattr(request.user, "donor_profile"):
            raise PermissionDenied("Create donor profile first")

        try:
            donation = Donation.objects.get(khalti_pidx=pidx, donor=request.user.donor_profile)
        except Donation.DoesNotExist:
            return Response({"detail": "Donation record not found"}, status=status.HTTP_404_NOT_FOUND)

        try:
            khalti_response = _khalti_post("/epayment/lookup/", {"pidx": pidx})
        except urlerror.HTTPError as exc:
            message = _extract_http_error_detail(exc, "Khalti verification failed")
            return Response({"detail": message}, status=status.HTTP_400_BAD_REQUEST)
        except Exception:
            return Response(
                {"detail": "Could not connect to Khalti"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        payment_state = str(khalti_response.get("status", "")).lower()
        if payment_state == "completed":
            donation.payment_status = "paid"
        elif payment_state in {"expired", "user canceled", "user cancelled", "cancelled", "canceled", "refunded"}:
            donation.payment_status = "failed"
        else:
            donation.payment_status = "pending"

        donation.khalti_transaction_id = khalti_response.get("transaction_id")
        donation.save(update_fields=["payment_status", "khalti_transaction_id"])

        create_ledger_entry(
            module="donations",
            reference_id=donation.id,
            action="updated",
            changed_by=request.user,
            new_data={
                "payment_status": donation.payment_status,
                "khalti_transaction_id": donation.khalti_transaction_id,
            },
            note="Khalti payment verification completed.",
        )

        return Response(
            {
                "payment_status": donation.payment_status,
                "khalti_status": khalti_response.get("status"),
                "donation": DonationSerializer(donation).data,
            },
            status=status.HTTP_200_OK,
        )

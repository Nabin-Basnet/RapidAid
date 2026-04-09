import requests
from django.conf import settings
from django.db.models import Q
from rest_framework.exceptions import PermissionDenied
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Donor, Donation
from .serializers import DonorSerializer, DonationSerializer
from incidents.models import IncidentStatus
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

    def create(self, request, *args, **kwargs):
        user = self.request.user

        if not hasattr(user, "donor_profile"):
            raise PermissionDenied("Create donor profile first")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        incident = serializer.validated_data["incident"]

        if incident.status == IncidentStatus.RESOLVED:
            raise PermissionDenied("Donations closed for this incident")
            
        donation_type = serializer.validated_data.get("donation_type")
        is_money = donation_type == "money"

        donation = serializer.save(donor=user.donor_profile, payment_status="pending" if is_money else "paid")

        if is_money:
            # Call Khalti API
            amount_in_paisa = int(donation.amount * 100)
            return_url = request.data.get("return_url", settings.FRONTEND_URL + "/payment/khalti-callback")
            
            payload = {
                "return_url": return_url,
                "website_url": settings.FRONTEND_URL,
                "amount": amount_in_paisa,
                "purchase_order_id": str(donation.id),
                "purchase_order_name": f"Donation to {incident.title}",
                "customer_info": {
                    "name": user.full_name or "Khalti User",
                    "email": user.email,
                    "phone": "9800000000"
                }
            }
            
            headers = {
                "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
                "Content-Type": "application/json"
            }
            
            try:
                khalti_response = requests.post(
                    f"{settings.KHALTI_API_URL}/epayment/initiate/",
                    json=payload,
                    headers=headers
                )
                khalti_response.raise_for_status()
                khalti_data = khalti_response.json()
                
                donation.pidx = khalti_data.get("pidx")
                donation.save()
                
                headers_out = self.get_success_headers(serializer.data)
                response_data = serializer.data
                response_data["payment_url"] = khalti_data.get("payment_url")
                return Response(response_data, status=201, headers=headers_out)
                
            except requests.exceptions.RequestException as e:
                donation.payment_status = "failed"
                donation.save()
                error_msg = e.response.text if e.response is not None else str(e)
                print("KHALTI INITIATE ERROR:", error_msg)
                return Response({"detail": f"Khalti initiation failed. Please check your Khalti Secret Key in .env. Khalti says: {error_msg}"}, status=500)
        else:
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
            headers_out = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=201, headers=headers_out)


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


# ==================================
# VERIFY KHALTI PAYMENT
# ==================================
class VerifyKhaltiPaymentAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        pidx = request.data.get("pidx")
        if not pidx:
            return Response({"success": False, "detail": "pidx is required"}, status=400)
            
        try:
            donation = Donation.objects.get(pidx=pidx, donor=request.user.donor_profile)
        except Donation.DoesNotExist:
            return Response({"success": False, "detail": "Payment not found"}, status=404)
            
        if donation.payment_status == "paid":
            return Response({"success": True, "detail": "Payment already verified", "data": DonationSerializer(donation).data})
            
        headers = {
            "Authorization": f"Key {settings.KHALTI_SECRET_KEY}",
            "Content-Type": "application/json"
        }
        
        try:
            khalti_res = requests.post(f"{settings.KHALTI_API_URL}/epayment/lookup/", json={"pidx": pidx}, headers=headers)
            khalti_res.raise_for_status()
            khalti_data = khalti_res.json()
            
            if khalti_data.get("status") == "Completed":
                donation.payment_status = "paid"
                donation.payment_ref = khalti_data.get("transaction_id")
                donation.save()
                
                create_ledger_entry(
                    module="donations",
                    reference_id=donation.id,
                    action="completed",
                    changed_by=request.user,
                    new_data={
                        "incident_id": donation.incident_id,
                        "donation_type": donation.donation_type,
                        "amount": str(donation.amount) if donation.amount is not None else None,
                        "payment_ref": donation.payment_ref,
                    },
                    note="Khalti Payment Completed.",
                )
                
                return Response({"success": True, "data": DonationSerializer(donation).data})
            else:
                return Response({"success": False, "detail": f"Payment status: {khalti_data.get('status')}"}, status=400)
                
        except requests.exceptions.RequestException as e:
            error_data = e.response.text if e.response else str(e)
            return Response({"success": False, "detail": f"Verification error: {error_data}"}, status=500)

from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Donor, Donation, DonationDistribution

User = get_user_model()


# --------------------------------------------------
#                    DONOR
# --------------------------------------------------
class DonorSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(
        source="user.get_full_name",
        read_only=True
    )

    class Meta:
        model = Donor
        fields = [
            "id",
            "user",
            "user_name",
            "donor_type",
        ]


# --------------------------------------------------
#                   DONATION
# --------------------------------------------------
class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.CharField(
        source="donor.user.get_full_name",
        read_only=True
    )

    class Meta:
        model = Donation
        fields = [
            "id",
            "donor",
            "donor_name",
            "incident",
            "family",
            "donation_type",
            "amount",
            "item_description",
            "quantity",
            "created_at",
        ]
        read_only_fields = ["created_at"]

    def validate(self, attrs):
        donation_type = attrs.get("donation_type")

        if donation_type == "money" and not attrs.get("amount"):
            raise serializers.ValidationError(
                {"amount": "Amount is required for money donation."}
            )

        if donation_type == "item":
            if not attrs.get("item_description") or not attrs.get("quantity"):
                raise serializers.ValidationError(
                    "Item description and quantity are required for item donation."
                )

        if not attrs.get("incident") and not attrs.get("family"):
            raise serializers.ValidationError(
                "Donation must be linked to either an incident or a family."
            )

        return attrs


# --------------------------------------------------
#            DONATION DISTRIBUTION
# --------------------------------------------------
class DonationDistributionSerializer(serializers.ModelSerializer):
    distributed_by_name = serializers.CharField(
        source="distributed_by.get_full_name",
        read_only=True
    )
    family_name = serializers.CharField(
        source="family.head_of_family_name",
        read_only=True
    )

    class Meta:
        model = DonationDistribution
        fields = [
            "id",
            "donation",
            "family",
            "family_name",
            "distributed_by",
            "distributed_by_name",
            "proof_photo_url",
            "distributed_at",
        ]
        read_only_fields = [
            "distributed_by",
            "distributed_at",
        ]

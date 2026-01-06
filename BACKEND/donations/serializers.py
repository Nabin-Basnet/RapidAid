from rest_framework import serializers
from .models import Donor, Donation


# ----------------------------------
# DONOR
# ----------------------------------
class DonorSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(
        source="user.email", 
        read_only=True
    )

    class Meta:
        model = Donor
        fields = ["id", "user", "user_email", "created_at"]
        read_only_fields = ["user", "created_at"]


# ----------------------------------
# DONATION
# ----------------------------------
class DonationSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = "__all__"
        read_only_fields = ["donor", "created_at"]

    def get_donor_name(self, obj):
        if obj.is_anonymous:
            return "Anonymous"
        return obj.donor.user.full_name

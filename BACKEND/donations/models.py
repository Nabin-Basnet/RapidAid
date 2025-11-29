from django.db import models
from django.conf import settings
from assessments.models import AffectedFamily
from incidents.models import Incident


class Donor(models.Model):
    USER_TYPE = [
        ('individual', 'Individual'),
        ('organization', 'Organization'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='donor_profile'
    )
    donor_type = models.CharField(max_length=20, choices=USER_TYPE)

    def __str__(self):
        return f"{self.user.full_name} - {self.donor_type}"


class Donation(models.Model):
    DONATION_TYPE = [
        ('money', 'Money'),
        ('item', 'Item'),
    ]

    donor = models.ForeignKey(
        Donor,
        on_delete=models.PROTECT,
        related_name='donations'
    )
    incident = models.ForeignKey(
        Incident,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='incident_donations'
    )
    family = models.ForeignKey(
        AffectedFamily,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='family_donations'
    )
    
    donation_type = models.CharField(max_length=10, choices=DONATION_TYPE)

    # money fields
    amount = models.FloatField(null=True, blank=True)

    # item fields
    item_description = models.CharField(max_length=255, null=True, blank=True)
    quantity = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Donation by {self.donor.user.full_name} ({self.donation_type})"


class DonationDistribution(models.Model):
    donation = models.ForeignKey(
        Donation,
        on_delete=models.PROTECT,
        related_name='distributions'
    )
    family = models.ForeignKey(
        AffectedFamily,
        on_delete=models.PROTECT,
        related_name='received_donations'
    )
    distributed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='distributed_donations'
    )
    proof_photo_url = models.URLField(null=True, blank=True)
    distributed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Distributed to {self.family.head_of_family_name}"

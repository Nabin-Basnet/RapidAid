from django.db import models
from django.conf import settings
from incidents.models import Incident


# ----------------------------------
# DONOR PROFILE (1 USER = 1 DONOR)
# ----------------------------------
class Donor(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="donor_profile"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.email


# ----------------------------------
# DONATION
# ----------------------------------
class Donation(models.Model):

    DONATION_TYPE = (
        ("money", "Money"),
        ("item", "Item"),
    )

    donor = models.ForeignKey(
        Donor,
        on_delete=models.PROTECT,
        related_name="donations"
    )

    incident = models.ForeignKey(
        Incident,
        on_delete=models.CASCADE,
        related_name="donations"
    )

    donation_type = models.CharField(
        max_length=10,
        choices=DONATION_TYPE
    )

    # Money
    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True
    )

    # Item
    item_name = models.CharField(
        max_length=255,
        blank=True
    )
    quantity = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    is_anonymous = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.donation_type} donation to {self.incident.title}"

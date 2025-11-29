from django.contrib import admin
from.models import Donation, Donor,DonationDistribution

# Register your models here.
admin.site.register(Donation)
admin.site.register(Donor)
admin.site.register(DonationDistribution)

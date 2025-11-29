from django.contrib import admin
from .models import IncidentType, Severity, Incident, IncidentMedia,IncidentVerification
# Register your models here.
admin.site.register(Incident)
admin.site.register(IncidentMedia) 
admin.site.register(IncidentVerification)

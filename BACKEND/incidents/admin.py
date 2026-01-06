from django.contrib import admin
from .models import Incident,IncidentMedia,IncidentTimeline
# Register your models here.
admin.site.register(Incident)
admin.site.register(IncidentMedia) 
admin.site.register(IncidentTimeline)
# admin.site.register(IncidentStatus)

from django.db import models
from django.conf import settings

class LedgerEntry(models.Model):
    module = models.CharField(max_length=50)
    reference_id = models.IntegerField()
    action = models.CharField(max_length=20)  # created/updated
    changed_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    old_data = models.JSONField(null=True, blank=True)
    new_data = models.JSONField(null=True, blank=True)
    note = models.TextField(null=True, blank=True)

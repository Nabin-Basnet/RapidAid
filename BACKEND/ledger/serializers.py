from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import LedgerEntry

User = get_user_model()


# --------------------------------------------------
#              LEDGER ENTRY
# --------------------------------------------------
class LedgerEntrySerializer(serializers.ModelSerializer):
    changed_by_name = serializers.CharField(
        source="changed_by.get_full_name",
        read_only=True
    )

    class Meta:
        model = LedgerEntry
        fields = [
            "id",
            "module",
            "reference_id",
            "action",
            "changed_by",
            "changed_by_name",
            "timestamp",
            "old_data",
            "new_data",
            "note",
        ]
        read_only_fields = [
            "changed_by",
            "timestamp",
        ]

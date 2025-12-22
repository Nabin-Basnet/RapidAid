from rest_framework import viewsets, permissions

from .models import LedgerEntry
from .serializers import LedgerEntrySerializer


# --------------------------------------------------
#              LEDGER ENTRY API
# --------------------------------------------------
class LedgerEntryViewSet(viewsets.ModelViewSet):
    queryset = LedgerEntry.objects.select_related("changed_by").order_by("-timestamp")
    serializer_class = LedgerEntrySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(changed_by=self.request.user)

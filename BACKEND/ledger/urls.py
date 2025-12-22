from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import LedgerEntryViewSet

router = DefaultRouter()
router.register(r"ledger-entries", LedgerEntryViewSet)

urlpatterns = [
    path("", include(router.urls)),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static


from .views import (
    IncidentViewSet,
    IncidentVerificationViewSet
)

router = DefaultRouter()
router.register(r"incidents", IncidentViewSet, basename="incident")
router.register(
    r"incident-verifications",
    IncidentVerificationViewSet,
    basename="incident-verification"
)

urlpatterns = [
    path("", include(router.urls)),
 ] 

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

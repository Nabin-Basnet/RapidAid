from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('Authapp.urls')),
    path('api/assessments/', include('assessments.urls')),
    path('api/donations/', include('donations.urls')),
    path('api/ledger/', include('ledger.urls')),
    path('api/rescue/', include('rescue.urls')),
    path('api/incidents/', include('incidents.urls')),
    path('api/volunteer/', include("volunteer.urls")),

    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

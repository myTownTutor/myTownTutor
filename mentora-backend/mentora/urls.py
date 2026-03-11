from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from api.views.admin_views import QRRedirectView


def health(request):
    return JsonResponse({'status': 'ok'})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('health', health, name='health'),
    path('qr/<str:slug>/', QRRedirectView.as_view(), name='qr-redirect'),
]

# Serve uploaded media files in development
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

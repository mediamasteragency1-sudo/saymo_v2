from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('django-admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/properties/', include('apps.properties.urls')),
    path('api/bookings/', include('apps.bookings.urls')),
    path('api/reviews/', include('apps.reviews.urls')),
    path('api/favorites/', include('apps.favorites.urls')),
    path('api/notifications/', include('apps.notifications.urls')),
    path('api/psychology/', include('apps.psychology.urls')),
    path('api/admin/', include('apps.users.admin_urls')),
    path('api/messages/', include('apps.messaging.urls')),
    path('api/reports/', include('apps.reports.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

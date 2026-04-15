from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ('booking', 'Réservation'),
        ('review', 'Avis'),
        ('system', 'Système'),
        ('recommendation', 'Recommandation'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='notifications')
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='system')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f'Notification pour {self.user.name}: {self.message[:50]}'

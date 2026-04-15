from django.db import models
from django.conf import settings


class Report(models.Model):
    REASON_CHOICES = [
        ('inappropriate', 'Contenu inapproprié'),
        ('fraud', 'Fraude'),
        ('spam', 'Spam'),
        ('inaccurate', 'Informations inexactes'),
        ('other', 'Autre'),
    ]
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('resolved', 'Résolu'),
        ('dismissed', 'Ignoré'),
    ]

    reporter = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reports'
    )
    property = models.ForeignKey(
        'properties.Property', on_delete=models.CASCADE,
        related_name='reports', null=True, blank=True
    )
    review = models.ForeignKey(
        'reviews.Review', on_delete=models.CASCADE,
        related_name='reports', null=True, blank=True
    )
    reason = models.CharField(max_length=20, choices=REASON_CHOICES)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    admin_note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'reports'
        ordering = ['-created_at']

    def __str__(self):
        target = self.property.title if self.property else f'Avis {self.review_id}'
        return f'Signalement de {self.reporter.name} - {target}'

from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator


class Review(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reviews')
    property = models.ForeignKey('properties.Property', on_delete=models.CASCADE, related_name='reviews')
    booking = models.OneToOneField('bookings.Booking', on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField()
    host_reply = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        unique_together = ('user', 'property', 'booking')

    def __str__(self):
        return f'Avis {self.rating}/5 - {self.user.name} - {self.property.title}'

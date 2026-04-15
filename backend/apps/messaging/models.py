from django.db import models
from django.conf import settings


class Message(models.Model):
    booking = models.ForeignKey(
        'bookings.Booking', on_delete=models.CASCADE, related_name='messages'
    )
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='sent_messages'
    )
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'messages'
        ordering = ['created_at']

    def __str__(self):
        return f'Message de {self.sender.name} - Reservation {self.booking_id}'

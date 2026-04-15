from .models import Notification


def create_notification(user, message, notif_type='system'):
    return Notification.objects.create(
        user=user,
        message=message,
        type=notif_type,
    )

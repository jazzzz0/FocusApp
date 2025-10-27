from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Notification
from django.contrib.contenttypes.models import ContentType

from posts.models import PostComment


@receiver(post_save, sender=PostComment)
def comment_notification(sender, instance, created, **kwargs):
    if created:
        recipient = instance.post.author
        actor = instance.author

        # Evitar auto-notificaciones
        if recipient == actor:
            return

        content_type = ContentType.objects.get_for_model(PostComment)

        Notification.objects.create(
            recipient=recipient,
            actor=actor,
            type="comment",
            content_type=content_type,
            object_id=instance.post.id,
        )

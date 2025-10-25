from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from users.models import AppUser

class Notification(models.Model):
    NOTIFICATION_TYPES = [
        # posibilidad de agregar más tipos de notificaciones
        # por el momento, solo se manejarán los comentarios
        ('comment', 'Comentario'),
    ]
    
    # usuario que recibe la notificación
    recipient = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='notifications')

    # usuario que realiza la acción
    actor = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='actor_notifications')
    
    type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    
    # enlace genérico al objeto relacionado (post, comentario, etc)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    target = GenericForeignKey('content_type', 'object_id')

    # estado
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.actor.username} - {self.get_type_display()}"

    @property
    def message(self):
        """ Devuelve un mensaje dinámico para mostrar en el frontend """
        base_message = f"{self.actor.username} "

        if self.type == "comment":
            base_message += "ha comentado tu publicación."

        else:
            base_message += "ha realizado una acción."

        return base_message

    class Meta:
        indexes = [
            models.Index(fields=['recipient', 'is_read']),
            models.Index(fields=['created_at'])
        ]
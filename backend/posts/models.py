from django.db import models
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.utils.text import slugify

from users.models import AppUser


import os, logging

class Category(models.Model):
    # atributos ID, name, slug, description
    name = models.CharField(
        max_length=100, unique=True, verbose_name="Nombre de la categoría"
    )
    slug = models.SlugField(
        max_length=100,
        unique=True,
        blank=True,
        help_text="Un identificador único para usar en URLs",
        verbose_name="Slug",
    )
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:  # Si no tiene slug definido, generará uno
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Post(models.Model):
    author = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE,  # Si se elimina el usuario, se eliminan los posts
        related_name="posts",  # Para acceder a los posts de un usuario con user.posts.all()
        verbose_name="Autor del post",
    )

    image = models.ImageField(
        upload_to="posts/",  # TODO: Añadir ruta de almacenamiento de imágenes MEDIA_ROOT + MEDIA_URL
        verbose_name="Fotografía",
        # TODO: Añadir validators (validaciones) de imagen (tamaño, formato, etc.)
    )

    title = models.CharField(
        max_length=200,
        blank=True, # Opcional
        null=True, # Opcional
        verbose_name="Título"
    )

    description = models.TextField(
        blank=True, # Opcional
        null=True, # Opcional
        verbose_name="Descripción"
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="posts", # Para acceder a los posts de una categoría con category.posts.all()
        verbose_name="Categoría",
    )
    
    allows_ratings = models.BooleanField(
        default=True,
        help_text="Indica si este post puede ser valorado por otros usuarios.",
        verbose_name="Permite calificaciones"
    )

    uploaded_at = models.DateTimeField(
        auto_now_add=True,  # Se actualiza automáticamente al crear el post
        verbose_name="Fecha de subida",
    )

    updated_at = models.DateTimeField(
        auto_now=True, verbose_name="Fecha de actualización"
    )
    
    class Meta:
        ordering = ['-uploaded_at'] # Más recientes a más antiguos
        # ordering = ['uploaded_at'] # Más antiguos a más recientes
        verbose_name = "Publicación"
        verbose_name_plural = "Publicaciones"

    def can_be_rated_by(self, user):
        if user == self.author:
            return False, "No puedes valorar tu propia publicación."
        
        if not self.allows_ratings:
            return False, "Esta publicación no permite valoraciones."

        from ratings.models import Rating
        if Rating.objects.filter(post=self, rater=user).exists():
            return False, "Ya has valorado esta publicación."

        return True, "Puedes valorar esta publicación."
    
    def __str__(self):
        return self.title or f"Post de {self.author} ({self.uploaded_at.date()})"

@receiver(pre_delete, sender=Post)
def delete_post_image(sender, instance, **kwargs):
    logger = logging.getLogger('posts')
    if instance.image:
        try:
            # Verificar si la imagen existe
            if os.path.exists(instance.image.path):
                # Eliminar el archivo físico
                os.remove(instance.image.path)

                # Log de éxito
                logger.info(f"Imagen eliminada: {instance.image.path}")
        
        except Exception as e:
            # Log del error pero no fallar la eliminación del post
            logger.error(f"Error al eliminar la imagen {instance.image.path}: {str(e)}")
            # No hacer raise para que no se interrumpa la eliminación del post

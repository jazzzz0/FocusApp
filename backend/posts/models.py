from django.db import models
from django.utils.text import slugify
from users.models import AppUser


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

    def __str__(self):
        return self.title or f"Post de {self.author} ({self.uploaded_at.date()})"
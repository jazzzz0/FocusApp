from django.db import models
from django.contrib.auth.models import AbstractUser

class AppUser(AbstractUser):
    # Campo obligatorio: Email. Se sobreescribe de AbstractUser
    email = models.EmailField(
        unique=True,
        blank=False,
        null=False,
        verbose_name="Dirección de correo electrónico"
    )

    # Campo no obligatorio: Foto de perfil (puedes dejarlo si quieres)
    profile_picture_url = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="URL de foto de perfil",
        help_text="Opcional. Se guarda la URL de la imagen.",
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']

    class Meta:
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"
        ordering = ['username']
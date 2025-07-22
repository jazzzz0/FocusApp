from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class AppUser(AbstractUser):
    # Campo obligatorio: Email. Se sobreescribe de AbstractUser
    email = models.EmailField(
        unique=True,
        blank=False, # obligatorio en forms
        null=False, # obligatorio en DB
        verbose_name="Dirección de correo electrónico"
    )

    # Campo obligatorio: Fecha de nacimiento, por eso dejamos null&blank=False
    date_of_birth = models.DateField(
        null=False,
        blank=False,
        verbose_name="Fecha de nacimiento",
        help_text="Formato: DD-MM-AAAA. Obligatorio para verificar la edad.",
    )

    # Campo no obligatorio: Foto de perfil
    profile_picture_url = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="URL de foto de perfil",
        help_text="Opcional. Se guarda la URL de la imagen.",
    )

    # Campo obligatorio: País
    country = models.CharField(
        max_length=100,
        verbose_name="País",
        help_text="Obligatorio. País de residencia.",
    )

    # Campo obligatorio: Provincia
    # TODO: añadir opciones predefinidas según país
    province = models.CharField(
        max_length=100,
        verbose_name="Provincia",
        help_text="Obligatorio. Provincia/Estado de residencia.",
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['email', 'date_of_birth', 'country', 'province']

    def is_adult(self):
        from datetime import date

        today = date.today()
        age = (
            today.year
            - self.date_of_birth.year
            - (
                (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )
        return age >= 18
    
    class Meta:
        # Nombres legibles en el panel de administración
        verbose_name = "Usuario"
        verbose_name_plural = "Usuarios"

        # Orden por defecto al listar usuarios
        ordering = ['username']


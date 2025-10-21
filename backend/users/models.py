from django.db import models
from django.contrib.auth.models import AbstractUser
from django.db.models.signals import pre_delete
from django.dispatch import receiver
from django.core.files.storage import default_storage
import logging

logger = logging.getLogger('users')

# Create your models here.
class AppUser(AbstractUser):
    # Campo obligatorio: Email. Se sobreescribe de AbstractUser
    email = models.EmailField(
        unique=True,
        blank=False,  # obligatorio en forms
        null=False,   # obligatorio en DB
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
    profile_pic = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
        verbose_name="Foto de perfil",
        help_text="Opcional. Se guarda la URL de la imagen.",
    )

    # Campo opcional: País. Por defecto, se guarda None.
    # Es información que será útil en el futuro.
    country = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default=None,
        verbose_name="País",
        help_text="Opcional. País de residencia.",
    )
    

    # Campo opcional: Provincia. Por defecto, se guarda None.
    # Es información que será útil en el futuro.
    province = models.CharField(
        max_length=100,
        blank=True,
        null=True,
        default=None,
        verbose_name="Provincia",
        help_text="Opcional. Provincia/Estado de residencia.",
    )

    # Campo opcional: Biografía. Por defecto, se guarda None.
    bio = models.TextField(
        blank=True,
        null=True,
        default=None,
        max_length=160,
        verbose_name="Biografía",
        help_text="Opcional. Biografía del usuario.",
    )

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email', 'date_of_birth']

    
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

@receiver(pre_delete, sender=AppUser)
def delete_user_profile_pic(sender, instance, **kwargs):
    """
    Signal para eliminar la foto de perfil del usuario cuando se elimina el usuario
    """
    if instance.profile_pic:
        try:
            # Borrar usando el storage backend
            if default_storage.exists(instance.profile_pic.name):
                default_storage.delete(instance.profile_pic.name)
                logger.info(f"Foto de perfil eliminada del storage: {instance.profile_pic.name}")
        except Exception as e:
            logger.error(f"Error al eliminar la foto de perfil {instance.profile_pic.name}: {str(e)}")
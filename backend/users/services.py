import logging
from django.core.files.storage import default_storage

logger = logging.getLogger("users")


class ProfilePhotoService:
    """
    Servicio para manejar las operaciones de fotos de perfil en Google Cloud Storage.
    """

    @staticmethod
    def delete_old_profile_photo(photo_field):
        """
        Elimina la foto de perfil anterior del storage si existe.

        Args:
            photo_field: El campo ImageField del modelo AppUser.

        Returns:
            bool: True si se eliminó correctamente, False en caso contrario.
        """
        if not photo_field:
            return True

        try:
            # Verificar si el archivo existe en el storage
            if default_storage.exists(photo_field.name):
                default_storage.delete(photo_field.name)
                logger.info(f"Foto de perfil anterior eliminada del storage: {photo_field.name}")
                return True
            else:
                logger.warning(f"Foto de perfil no encontrada en storage: {photo_field.name}")
                return True
        except Exception as e:
            logger.error(f"Error al eliminar la foto de perfil {photo_field.name}: {str(e)}")
            return False

    @staticmethod
    def update_profile_photo(user_instance, new_photo):
        """
        Actualiza la foto de perfil del usuario, eliminando la anterior si existe.

        Args:
            user_instance: Instancia del modelo AppUser.
            new_photo: Nueva foto de perfil (InMemoryUploadedFile o UploadedFile)

        Returns:
            bool: True si se actualizó correctamente, False en caso contrario.
        """
        try:
            # Guardar referencia a la foto anterior antes de actualizar
            old_photo_field = user_instance.profile_pic

            # Eliminar la foto anterior del storage
            if old_photo_field:
                ProfilePhotoService.delete_old_profile_photo(old_photo_field)

            # Actualizar el campo con la nueva foto
            user_instance.profile_pic = new_photo
            user_instance.save()

            logger.info(f"Foto de perfil actualizada para usuario {user_instance.username}")
            return True

        except Exception as e:
            logger.error(
                f"Error al actualizar foto de perfil para usuario {user_instance.username}: {str(e)}"
            )
            return False

    @staticmethod
    def remove_profile_photo(user_instance):
        """
        Elimina la foto de perfil del usuario y del storage

        Args:
            user_instance: Instancia del modelo AppUser

        Returns:
            bool: True si se eliminó correctamente, False en caso contrario
        """
        try:
            # Guardar referencia a la foto actual
            current_photo_field = user_instance.profile_pic

            # Eliminar la foto del storage si existe
            if current_photo_field:
                ProfilePhotoService.delete_old_profile_photo(current_photo_field)

            # Establecer el campo como None/Null
            user_instance.profile_pic = None
            user_instance.save()

            logger.info(f"Foto de perfil eliminada para usuario {user_instance.username}")
            return True

        except Exception as e:
            logger.error(
                f"Error al eliminar foto de perfil para usuario {user_instance.username}: {str(e)}"
            )
            return False

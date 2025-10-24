"""
Módulo de utilidades para validación de imágenes.
Contiene funciones reutilizables para validar archivos de imagen en toda la aplicación.
"""

from PIL import Image


def validate_image_file(image_file, max_size_mb=5, min_width=100, min_height=100, allowed_formats=None):
    """
    Valida el archivo de imagen según los requisitos especificados.
    
    Args:
        image_file: Archivo de imagen a validar
        max_size_mb (int): Tamaño máximo en MB (por defecto 5MB)
        min_width (int): Ancho mínimo en píxeles (por defecto 100px)
        min_height (int): Alto mínimo en píxeles (por defecto 100px)
        allowed_formats (list): Lista de formatos permitidos (por defecto JPEG, PNG, WebP)
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    
    if allowed_formats is None:
        allowed_formats = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    
    # Validar tamaño de la imagen
    max_size_bytes = max_size_mb * 1024 * 1024
    if image_file.size > max_size_bytes:
        return False, f"El tamaño de la imagen no debe exceder los {max_size_mb}MB"
    
    # Validar formato de la imagen
    if image_file.content_type not in allowed_formats:
        return False, "La imagen debe ser una foto válida (JPEG, PNG o WebP)"
    
    # Validar dimensiones de la imagen
    try:
        with Image.open(image_file) as img:
            if img.width < min_width or img.height < min_height:
                return False, f"La imagen debe tener al menos {min_width}x{min_height}px"
    except Exception as e:
        return False, "Error al validar las dimensiones de la imagen"
    
    return True, None


def validate_profile_picture(image_file):
    """
    Valida específicamente una foto de perfil de usuario.
    Usa parámetros más estrictos para fotos de perfil.
    
    Args:
        image_file: Archivo de imagen a validar
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    return validate_image_file(
        image_file,
        max_size_mb=2,  # 2MB para fotos de perfil
        min_width=100,    # Dimensiones más pequeñas permitidas
        min_height=100,
        allowed_formats=['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    )


def validate_post_image(image_file):
    """
    Valida específicamente una imagen de publicación.
    Usa los parámetros estándar para imágenes de posts.
    
    Args:
        image_file: Archivo de imagen a validar
    
    Returns:
        tuple: (is_valid: bool, error_message: str or None)
    """
    return validate_image_file(
        image_file,
        max_size_mb=5,   # 5MB para imágenes de posts
        min_width=100,   # Dimensiones mínimas estándar
        min_height=100,
        allowed_formats=['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
    )

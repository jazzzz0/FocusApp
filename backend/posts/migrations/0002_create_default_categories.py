# Migration para crear las categorías por defecto
from django.db import migrations


def create_default_categories(apps, schema_editor):
    """
    Función que crea las categorías por defecto
    """
    Category = apps.get_model('posts', 'Category')
    
    categories_data = [
        {
            'name': 'Naturaleza y Paisajes',
            'slug': 'naturaleza',
            'description': 'Explora la belleza del mundo. Desde majestuosas montañas y serenos océanos hasta la vida silvestre y los detalles de la flora. Captura la esencia de la Tierra.'
        },
        {
            'name': 'Retrato y Moda',
            'slug': 'retratos',
            'description': 'El arte de la persona. Muestra expresiones, emociones e identidades. Fotografía de estudio, street style o producciones de moda de alta costura.'
        },
        {
            'name': 'Arquitectura y Urbanismo',
            'slug': 'arquitectura',
            'description': 'Geometría y pulso de la ciudad. Documenta estructuras, diseño de interiores, líneas urbanas, y el contraste entre lo antiguo y lo moderno.'
        },
        {
            'name': 'Deportes y Acción',
            'slug': 'deportes',
            'description': 'Velocidad, energía y el momento decisivo. Congela el movimiento, la pasión atlética y la adrenalina de cualquier disciplina o actividad de alto impacto.'
        },
        {
            'name': 'Arte Conceptual y Fotomanipulación',
            'slug': 'arte',
            'description': 'Rompe los límites de la realidad. Crea imágenes que transmiten ideas, emociones complejas o mundos de fantasía a través de técnicas de edición avanzada o montajes creativos.'
        },
        {
            'name': 'Fotografía Documental y Callejera',
            'slug': 'documental',
            'description': 'Historias sin filtros. Captura momentos espontáneos, la vida cotidiana, eventos sociales y narrativas que informan e inspiran. La realidad en su forma más pura.'
        },
        {
            'name': 'Comida y Estilismo Culinario',
            'slug': 'comida',
            'description': 'El sabor en imágenes. Desde platos gourmet y recetas caseras hasta el arte de la presentación. Fotografía que deleita y abre el apetito.'
        }
    ]
    
    # Crear cada categoría si no existe
    for category_data in categories_data:
        category, created = Category.objects.get_or_create(
            name=category_data['name'],
            defaults={
                'description': category_data['description'],
                'slug': category_data['slug']
            }
        )
        if created:
            print(f"Categoría creada: {category.name}")
        else:
            print(f"Categoría ya existe: {category.name}")


def reverse_create_categories(apps, schema_editor):
    """
    Función para revertir la migración (eliminar las categorías creadas)
    """
    Category = apps.get_model('posts', 'Category')
    
    # Lista de categorías a eliminar
    category_names = [
        'Naturaleza y Paisajes', 'Retrato y Moda', 'Arquitectura y Urbanismo', 'Deportes y Acción', 
        'Arte Conceptual y Fotomanipulación', 'Fotografía Documental y Callejera', 'Comida y Estilismo Culinario'
    ]
    
    # Eliminar las categorías
    for name in category_names:
        try:
            category = Category.objects.get(name=name)
            category.delete()
            print(f"Categoría eliminada: {name}")
        except Category.DoesNotExist:
            print(f"Categoría no encontrada: {name}")


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            create_default_categories,
            reverse_create_categories,
            elidable=True,
        ),
    ]

from rest_framework import serializers
from users.models import AppUser
from .models import Category, Post
from PIL import Image

from rest_framework import serializers
from users.models import AppUser
from .models import Category, Post, PostComment
from PIL import Image


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        #fields = '__all__' # Trae todos los campos
        fields = ['id', 'name', 'slug', 'description'] # Trae los campos que se especifican

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = ['id', 'username', 'profile_pic']

class PostSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all())
    ratings_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Post
        fields = ["id", "author", "image", "title", "description", "category", "allows_ratings", "ratings_count", "uploaded_at", "updated_at"]
        
        # El usuario no puede elegir quién es el author.
        # El author siempre debe ser el usuario autenticado que hace la petición.
        # Las fechas se asignan automáticamente.
        read_only_fields = ["author", "ratings_count", "uploaded_at", "updated_at"]
        # Sin usar read_only_fields, usuarios maliciosos podrían crear posts como si fueran otros usuarios,
        # o modificar fechas de subida y actualización.

        extra_kwargs = {
            'image': {'required': True},
            'category': {'required': True},
            'allows_ratings': {'required': True},
            'title': {'required': False},
            'description': {'required': False},
        }

        # Flujo:
        # El usuario envía los extra_kwargs.
        # El sistema asigna automáticamente los read_only_fields.
        # Resultado: Post creado con los campos necesarios.

    def validate_image(self, value):
        # Importar la función de validación desde utils
        from utils.image_validation import validate_post_image
        
        is_valid, error_message = validate_post_image(value)
        if not is_valid:
            raise serializers.ValidationError(error_message)
        
        return value

    def validate_category(self, value):
        # Con PrimaryKeyRelatedField, value ya es un objeto Category
        # No necesitamos hacer conversión adicional
        return value

    # TODO: Validar contenido de texto de title y description (no se permite discurso de odio, etc.)

    def create(self, validated_data):

        # Obtener el usuario autenticado
        authenticated_user = self.context['request'].user

        if not authenticated_user.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado.")

        # Asignar el usuario autenticado como author
        validated_data['author'] = authenticated_user

        post = Post(**validated_data)

        post.save()

        return post

    def update(self, instance, validated_data):

        # Campos editables
        editable_fields = ['title', 'description', 'category', 'allows_ratings']
        
        # Filtrar solo los campos editable
        filtered_data = {k: v for k, v in validated_data.items() if k in editable_fields}

        for attr, value in filtered_data.items():
            setattr(instance, attr, value)

        instance.save()

        return instance


class CommentListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = PostComment
        fields = ["id", "author", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "created_at", "updated_at"] # El autor se asigna automáticamente    
        depth = 1  # Para incluir detalles del autor

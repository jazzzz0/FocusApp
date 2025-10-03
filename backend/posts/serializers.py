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
    class Meta:
        model = Post
        fields = ["id", "author", "image", "title", "description", "category", "allows_ratings", "uploaded_at", "updated_at"]
        
        # El usuario no puede elegir quién es el author.
        # El author siempre debe ser el usuario autenticado que hace la petición.
        # Las fechas se asignan automáticamente.
        read_only_fields = ["author", "uploaded_at", "updated_at"]
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

        # Validar tamaño de la imagen (5MB)
        if value.size > 1024 * 1024 * 5:
            raise serializers.ValidationError("El tamaño de la imagen no debe exceder los 5MB")
  
        # Validar formato de la imagen
        if value.content_type not in ['image/jpeg', 'image/png', 'image/jpg', 'image/webp']:
            raise serializers.ValidationError("La imagen debe ser una foto")

        # Validar dimensiones de la imagen
        try:
            with Image.open(value) as img:
                if img.width < 100 or img.height < 100:
                    raise serializers.ValidationError("La imagen debe tener al menos 100x100px")
        except Exception as e:
            raise serializers.ValidationError("Error al validar las dimensiones de la imagen")

        return value

    def validate_category(self, value):
        try:
            if isinstance(value, Category):
                return value
            category = Category.objects.get(id=value)
            return category
        except Category.DoesNotExist:
            raise serializers.ValidationError("La categoría no existe")

        # debe devolver el objeto que se usará en create()
        # para el campo "category" que es clave foránea, se espera un objeto, no un ID

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

class PostCommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)
    class Meta:
        model = PostComment
        fields = ['id', 'post', 'author', 'content', 'created_at', 'updated_at']
        read_only_fields = ['author', 'created_at', 'updated_at']

        extra_kwargs = {
            'post': {'required': True},
            'content': {'required': True, 'max_length': 500},
        }

    def validate_post(self, value):
        try:
            if isinstance(value, Post):
                return value
            post = Post.objects.get(id=value)
            return post
        except Post.DoesNotExist:
            raise serializers.ValidationError("El post no existe")

    def create(self, validated_data):
        authenticated_user = self.context['request'].user

        if not authenticated_user.is_authenticated:
            raise serializers.ValidationError("Usuario no autenticado.")

        validated_data['author'] = authenticated_user

        comment = PostComment(**validated_data)
        comment.save()
        return comment

    def update(self, instance, validated_data):
        if 'content' in validated_data:
            instance.content = validated_data['content']
            instance.save()
        return instance
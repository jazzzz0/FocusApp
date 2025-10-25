from rest_framework import serializers
from users.models import AppUser
from .models import Category, Post, PostComment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description']

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
        read_only_fields = ["author", "ratings_count", "uploaded_at", "updated_at"]

        extra_kwargs = {
            'image': {'required': True},
            'category': {'required': True},
            'allows_ratings': {'required': True},
            'title': {'required': False},
            'description': {'required': False},
        }

    def validate_image(self, value):
        from utils.image_validation import validate_post_image
        
        is_valid, error_message = validate_post_image(value)
        if not is_valid:
            raise serializers.ValidationError(error_message)
        
        return value

    def validate_category(self, value):
        # Con PrimaryKeyRelatedField, value ya es un objeto Category
        # No necesitamos hacer conversión adicional
        return value

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
        read_only_fields = ["id", "author", "created_at", "updated_at"]
        depth = 1  # Para incluir detalles del autor

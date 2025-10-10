class CommentListSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = PostComment
        fields = ["id", "author", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "created_at", "updated_at"] # El autor se asigna automáticamente    
        depth = 1  # Para incluir detalles del autor
        ordering = ['-created_at']  # Ordenar por fecha de creación descendente 
        # Nota: 'ordering' no es un atributo válido en Meta, se debe manejar en la vista o queryset
        # Si se necesita un orden específico, se puede definir en el modelo PostComment
class PostCommentSerializer(serializers.ModelSerializer):
    author = AuthorSerializer(read_only=True)

    class Meta:
        model = PostComment
        fields = ["id", "author", "content", "created_at", "updated_at"]
        read_only_fields = ["id", "author", "created_at", "updated_at"] # El autor se asigna automáticamente    
        depth = 1  # Para incluir detalles del autor    

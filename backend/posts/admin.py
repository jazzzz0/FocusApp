from django.contrib import admin
from .models import Post, Category, PostComment
from django.contrib.auth.models import User  # para poder usarlo en list_filter


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
    list_filter = ("name",)


@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = (
        "author",
        "image",
        "title",
        "description",
        "category",
        "uploaded_at",
    )
    list_filter = (
        "author",
        "category",
        "uploaded_at",
    )  # Permite filtrar por autor, categoría y fecha
    search_fields = (
        "title",
        "description",
        "author__username",
        "category__name",
    )  # Permite buscar por título, descripción, nombre de autor y nombre de categoría
    raw_id_fields = (
        "author",
        "category",
    )  # Útil para ForeignKeys con muchos objetos, permite buscar por ID
    readonly_fields = (
        "uploaded_at",
        "updated_at",
    )  # uploaded_at y updated_at se autocompletan, no deberían ser editables


@admin.register(PostComment)
class PostCommentAdmin(admin.ModelAdmin):
    list_display = ("author", "post", "content", "created_at", "updated_at")
    search_fields = ("content", "author__username", "post__title")
    list_filter = ("author", "post", "created_at")

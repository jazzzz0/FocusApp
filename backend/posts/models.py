from django.db import models
from django.utils.text import slugify

# Create your models here.

class Post(models.Model):
    pass

class Category(models.Model):
    # atributos ID, name, slug, description
    name = models.CharField(max_length=100, unique=True, verbose_name="Nombre de la categoría")
    slug = models.SlugField(max_length=100, unique=True, blank=True, help_text="Un identificador único para usar en URLs", verbose_name="Slug")
    description = models.TextField(blank=True, null=True, verbose_name="Descripción")

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Categoría"
        verbose_name_plural = "Categorías"
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug: # Si no tiene slug definido, generará uno
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
from django.db import models
from django.core.validators import MaxValueValidator, MinValueValidator

from django.utils import timezone
from datetime import timedelta

from django.core.exceptions import ValidationError

from posts.models import Post
from users.models import AppUser


class Rating(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="ratings",
        verbose_name="Publicación",
    )

    rater = models.ForeignKey(
        AppUser,
        on_delete=models.CASCADE,
        related_name="ratings_given",
        verbose_name="Usuario que valora",
    )

    composition = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Composición",
        help_text="Valoración de la composición fotográfica (1-5 estrellas)",
    )

    clarity_focus = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Claridad y enfoque",
        help_text="Valoración de la claridad y enfoque (1-5 estrellas)",
    )

    lighting = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Iluminación",
        help_text="Valoración de la iluminación (1-5 estrellas)",
    )

    creativity = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Creatividad",
        help_text="Valoración de la creatividad (1-5 estrellas)",
    )

    technical_adaptation = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Adaptación técnica",
        help_text="Valoración de la adaptación técnica (1-5 estrellas)",
    )

    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Fecha de valoración"
    )

    updated_at = models.DateTimeField(
        auto_now=True, verbose_name="Fecha de última actualización"
    )

    class Meta:
        unique_together = ["post", "rater"]
        verbose_name = "Valoración"
        verbose_name_plural = "Valoraciones"
        ordering = ["-created_at"]

    def can_be_edited(self):
        """Verifica si la valoración puede ser editada en el rango de 24 horas"""
        time_limit = self.created_at + timedelta(hours=24)
        return timezone.now() <= time_limit

    def clean(self):
        super().clean()
        if self.rater == self.post.author:
            raise ValidationError("No puedes valorar tu propia publicación.")

        if not self.post.allows_ratings:
            raise ValidationError("Esta publicación no permite valoraciones.")

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


    def get_average_score(self):
        """Calcula la puntuación promedio de esta valoración individual"""
        scores = [
            self.composition,
            self.clarity_focus,
            self.lighting,
            self.creativity,
            self.technical_adaptation,
        ]
        return sum(scores) / len(scores)

    @classmethod
    def get_post_averages(cls, post):
        """Calcula los promedios de todos los ratings de un post"""

        # Obtener todas las valoraciones de la foto
        ratings = cls.objects.filter(post=post)
        
        if not ratings.exists():
            return None # No hay valoraciones
        

        # Calcula promedios eficientemente
        averages = ratings.aggregate(
            avg_composition=models.Avg('composition'),
            avg_clarity_focus=models.Avg('clarity_focus'),
            avg_lighting=models.Avg('lighting'),
            avg_creativity=models.Avg('creativity'),
            avg_technical_adaptation=models.Avg('technical_adaptation')
        )
        
        # Calcular promedio general de todos los aspectos
        overall = sum([
            averages['avg_composition'],
            averages['avg_clarity_focus'],
            averages['avg_lighting'],
            averages['avg_creativity'],
            averages['avg_technical_adaptation']
        ]) / 5
        
        return {
            'composition': round(averages['avg_composition'], 2),
            'clarity_focus': round(averages['avg_clarity_focus'], 2),
            'lighting': round(averages['avg_lighting'], 2),
            'creativity': round(averages['avg_creativity'], 2),
            'technical_adaptation': round(averages['avg_technical_adaptation'], 2),
            'overall': round(overall, 2),
            'total_ratings': ratings.count()
        }

    def __str__(self):
        return f"{self.rater.username} - {self.post} - Valoración"

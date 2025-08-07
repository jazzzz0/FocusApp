from rest_framework import serializers
from .models import Rating


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = [
            "post",
            "rater",
            "composition",
            "clarity_focus",
            "lighting",
            "creativity",
            "technical_adaptation",
        ]

    def validate(self, data):
        # Verificar que el rater no sea el author
        if data['rater'] == data['post'].author:
            raise serializers.ValidationError({'rater': 'No puedes valorar tu propia publicación.'})

        # Verificar que el post permita valoraciones
        if not data['post'].allows_ratings:
            raise serializers.ValidationError({'post': 'Esta publicación no permite valoraciones.'})

        if Rating.objects.filter(post=data['post'], rater=data['rater']).exists():
            raise serializers.ValidationError({'rater': 'Ya has valorado esta publicación.'})

        return data
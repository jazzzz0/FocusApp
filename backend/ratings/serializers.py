from rest_framework import serializers
from .models import Rating


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = [
            "rater",
            "composition",
            "clarity_focus",
            "lighting",
            "creativity",
            "technical_adaptation",
        ]
        
        read_only_fields = ["rater"] 


    def validate(self, data):
        # Validar que las valoraciones estén entre 1 y 5
        score_fields = ['composition', 'clarity_focus', 'lighting', 'creativity', 'technical_adaptation']
        for field in score_fields:
            if not 1 <= data[field] <= 5:
                raise serializers.ValidationError({field: f"La puntuación para '{field}' debe estar entre 1 y 5."})

        return data
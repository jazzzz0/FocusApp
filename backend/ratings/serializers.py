from rest_framework import serializers
from .models import Rating


class RatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        fields = [
            "id",
            "rater",
            "post",
            "composition",
            "clarity_focus",
            "lighting",
            "creativity",
            "technical_adaptation",
            "created_at",
            "updated_at"
        ]
        
        read_only_fields = ["id", "rater", "post", "created_at", "updated_at"]


    def validate(self, data):
        score_fields = ['composition', 'clarity_focus', 'lighting', 'creativity', 'technical_adaptation']
        
        # Si no hay instancia, es decir, si es para CREAR nueva valoración
        if self.instance is None:
            # Me fijo que estén todos los campos que son obligatorios
            for field in score_fields:
                if field not in data:
                    raise serializers.ValidationError({field: "Este campo es obligatorio."})
        
        # Aplica para POST, PUT, PATCH
        # Por cada campo en la lista, obtengo los valores de cada uno
        for field in score_fields:
            value = data.get(field)
            # Si no tiene valor (put/patch), continua y no hay error
            if value is not None:
                # Validar que las valoraciones estén entre 1 y 5
                if not 1 <= value <= 5:
                    raise serializers.ValidationError({field: f"La puntuación para '{field}' debe estar entre 1 y 5."})

        return data

    def update(self, instance, validated_data):
        # Todos los campos editables
        editable_fields = ['composition', 'clarity_focus', 'lighting', 'creativity', 'technical_adaptation']

        # Filtrar solo los campos editables incluídos en el request
        filtered_data = {k: v for k, v in validated_data.items() if k in editable_fields}

        for attr, value, in filtered_data.items():
            setattr(instance, attr, value)
        
        instance.save()

        return instance

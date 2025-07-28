from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        #fields = '__all__' # Trae todos los campos
        fields = ['id', 'name', 'slug', 'description'] # Trae los campos que se especifican

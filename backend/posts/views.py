from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Category
from .serializers import CategorySerializer

# Vista para listar todas las categorías
class CategoryListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """
        Lista todas las categorías disponibles
        """
        try:
            categories = Category.objects.all()
            serializer = CategorySerializer(categories, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": "No se pudieron obtener las categorías.", "detalle": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        

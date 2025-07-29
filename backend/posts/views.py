from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Category, Post
from .serializers import CategorySerializer, PostSerializer

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
        
class PostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Crear una nueva publicación de imagen
        """
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({"success": False, "message": "Error interno del servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        # return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": False, "message": "Error de validación", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

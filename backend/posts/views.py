from django.shortcuts import render
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import Category, Post
from .serializers import CategorySerializer, PostSerializer
import logging
import os

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

    def delete(self, request, pk):
        logger = logging.getLogger('posts')

        try:
            post = Post.objects.get(id=pk)
            
            if post.author != request.user:
                return Response({"success": False, "message": "No puedes eliminar este post."}, status=status.HTTP_403_FORBIDDEN)

            # Guardar información antes de eliminar
            post_id = post.id
            post_title = post.title
            username = request.user.username

            with transaction.atomic():
                post.delete()

            logger.info(f"Post eliminado: Usuario {username} - Post ID: {post_id} - Título: {post_title}")

            return Response({"success": True, "message": "Post eliminado correctamente"}, status=status.HTTP_200_OK)

        except Post.DoesNotExist:
            return Response({"success": False, "message": "Post no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
                return Response({"success": False, "message": "Error interno del servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

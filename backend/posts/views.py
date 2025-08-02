from django.shortcuts import render
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
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

class PostPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    # max_page_size = 100
    max_page_size = 30

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

    def put(self, request, pk):
        logger = logging.getLogger('posts')

        try:
            post = Post.objects.get(id=pk)
            if post.author != request.user:
                return Response({"success":False, "message": "No puedes editar este post."}, status=status.HTTP_403_FORBIDDEN)

            serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})

            if serializer.is_valid():
                serializer.save()
                
                # Log de actualización exitosa
                logger.info(f"Post actualizado: Usuario {post.author.username} - Post ID: {post.id} - Campos modificados: {list(request.data.keys())}")
                
                return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
            else:
                logger.warning(f"Error de validación al actualizar el post ID {pk}: {serializer.errors}")
                return Response({"success":False, "message": "Error de validación", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        except Post.DoesNotExist:
            logger.warning(f"No se puede actualizar un post inexistente")
            return Response({"success": False, "message": "Post no encontrado"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error al actualizar el post ID {pk}: {str(e)}")
            return Response({"success": False, "message": "Error interno del servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def patch(self, request, pk):
        return self.put(request, pk)

    def get(self, request):
        try:
            posts = Post.objects.all()
            paginator = PostPagination()
            result_page = paginator.paginate_queryset(posts, request)
            serializer = PostSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Exception as e:
            return Response({"success": False, "message": "No se pudieron obtener las publicaciones.", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


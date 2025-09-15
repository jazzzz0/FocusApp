from django.shortcuts import render
from django.db import transaction
from django.conf import settings
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import OpenApiParameter, extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from .models import Category, Post
from users.models import AppUser
from .serializers import CategorySerializer, PostSerializer
import logging
import json

# Vista para listar todas las categorías
@extend_schema(responses={200: CategorySerializer(many=True)})
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
    serializer_class = PostSerializer

    # Documentación para el método POST
    @extend_schema(
        request=PostSerializer,
        responses={
            201: PostSerializer,
            400: {"description": "Error de validación"}
        },
        description="Crear una nueva publicación de imagen.",
    )
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

    # Documentación para el método DELETE
    @extend_schema(
        parameters=[
            OpenApiParameter('pk', OpenApiTypes.INT, OpenApiParameter.PATH, description="ID del post a eliminar")
        ],
        responses = {
            200: {"description": "Post eliminado correctamente"},
            403: {"description": "No puedes eliminar este post"},
            404: {"description": "Post no encontrado"},
        },
        description="Eliminar una publicación.",
    )
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

    # Documentación para métodos PUT y PATCH
    @extend_schema(
        parameters=[
            OpenApiParameter('pk', OpenApiTypes.INT, OpenApiParameter.PATH, description="ID del post a actualizar"),
        ],
        request = PostSerializer,
        responses = {
            200: PostSerializer,
            403: {"description": "No puedes editar este post"},
            404: {"description": "Post no encontrado"}
        },
        description="Editar una publicación de imagen.",
    )
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

    def _apply_filters(self, queryset, request):
        if 'author' in request.query_params:
            author_id = request.query_params['author']

            try:
                user = AppUser.objects.get(id=author_id)
                queryset = queryset.filter(author=user)
            except AppUser.DoesNotExist:
                raise AppUser.DoesNotExist(f"Usuario con ID {author_id} no existe")

        if 'category' in request.query_params:
            category_id = request.query_params['category']
            try:
                category = Category.objects.get(id=category_id)
                queryset = queryset.filter(category=category)
            except Category.DoesNotExist:
                raise Category.DoesNotExist(f"La categoría ID {category_id} no existe")

        return queryset

    @extend_schema(
        parameters = [
            OpenApiParameter('pk', OpenApiTypes.INT, OpenApiParameter.PATH, description="ID del post (opcional)"),
            OpenApiParameter('author', OpenApiTypes.INT, OpenApiParameter.QUERY, description="Filtrar por ID de autor (opcional)"),
            OpenApiParameter('category', OpenApiTypes.INT, OpenApiParameter.QUERY, description="Filtrar por ID de categoría (opcional)"),
        ],
        responses={
            200: PostSerializer(many=True),
            404: {"description": "Post no encontrado"}
        },
        description="Obtener publicación por ID. \nOtros filtros: Obtener todas las publicaciones de un autor (usuario) o todas las publicaciones de una categoría."
    )
    def get(self, request, pk=None):
        try:
            if pk:
                post = Post.objects.get(id=pk)
                serializer = PostSerializer(post)
                return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

            posts = Post.objects.all()
            posts = self._apply_filters(posts, request)

            paginator = PostPagination()
            result_page = paginator.paginate_queryset(posts, request)
            serializer = PostSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except Post.DoesNotExist:
            return Response({"success": False, "message": "Post no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except AppUser.DoesNotExist as e:
            return Response({"success": False, "message": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Category.DoesNotExist as e:
            return Response({"success": False, "message": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"success": False, "message": "No se pudieron obtener las publicaciones.", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class DescriptionSuggestionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Validar envío de imagen
        image = request.FILES.get('image')
        if not image:
            return Response({"success": False, "message": "No se envió ninguna imagen"}, status=status.HTTP_400_BAD_REQUEST)
        
        
        try:
            image_bytes = image.read()
            
            custom_prompt = """
            **Tu Rol y Tarea Principal:**
            Actúa rigurosamente como la siguiente persona:
            ---
            Usuario de una comunidad (red social) de fotografia, que puede definir la imagen tanto en un lenguaje tecnico, en un lenguaje natural.
            ---
            Tu tarea es generar un paquete de contenido multimedia sobre la imagen adjunta. Debes dar una descripción para un caption de publicación tanto en lenguaje técnico, lenguaje natural, y en lenguaje natural aún más reducido y ameno, para que el usuario pueda elegir una de estas descripciones para su publicación.
            Debes ser preciso hablando como el usuario que tomó la fotografía. La descripción debe ser clara, no puedes hablar de posibles.
            Además, puedes usar emojis si lo deseas.

            **Reglas de Formato de Salida (MUY IMPORTANTE):**
            1.  Tu respuesta debe ser **EXCLUSIVAMENTE** un objeto JSON válido, sin ningún texto, explicación o markdown antes o después.
            2.  El JSON debe seguir estrictamente la siguiente estructura y claves:
                {{
                "contenido_generado": {{
                    "lenguaje_tecnico_imagen": "...",
                    "lenguaje_natural_imagen": "...",
                    "lenguaje_natural_ameno_imagen": "...",
                }}
                }}

            **Instrucciones Adicionales:**
            -   Asegúrate de que cada pieza de contenido refleje fielmente la imagen adjunta.
            -   No inventes datos, pero sé creativo dentro de los límites del rol asignado.

            **COMIENZA LA SALIDA JSON A CONTINUACIÓN:**
            """

            # Llamada a Gemini
            result = settings.GEMINI_MODEL.generate_content([{"mime_type": "image/jpeg", "data": image_bytes}, custom_prompt])

            # Obtener el texto devuelto y parsear JSON
            clean_response_text = result.text.replace("```json", "").replace("```", "").strip()
            
            print("RESPUESTA GEMINI:\n", clean_response_text)
            
            data = json.loads(clean_response_text)

            return Response({"success": True, "data": data}, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            return Response({"success": False, "message": "La respuesta de Gemini no fue un JSON válido."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({"success": False, "message": "No se pudo completar la petición.", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
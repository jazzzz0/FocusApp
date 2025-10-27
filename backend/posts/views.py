from django.db import transaction
from django.db.models import Count
from django.conf import settings
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema, OpenApiExample
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Category, Post, PostComment
from users.models import AppUser
from .serializers import CategorySerializer, PostSerializer, CommentListSerializer
import logging
import json

# Vista para listar todas las categorías
class CategoryListView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(
        summary="Lista todas las categorías disponibles",
        description="Devuelve una lista con todas las categorías disponibles.",
        responses={
            200: OpenApiResponse(
                response=CategorySerializer(many=True),
                description="Lista de categorías obtenida exitosamente"
            ),
            500: {"type": "object", "properties":{
                "error": {"type": "string"},
                "detalle": {"type": "string"},
            }},
        },
        tags=["Categorías"]
    )
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

class PostListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

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

    def _get_posts_queryset(self):
        return Post.objects.annotate(ratings_count=Count('ratings')).order_by('-uploaded_at') 

    # --- Método GET para listar publicaciones --- #
    @extend_schema(
        operation_id="api_posts_list",
        summary="Obtener todas las publicaciones",
        description=(
            "Este endpoint permite obtener: una **lista paginada de publicaciones**.\n\n"
            "Admite parámetros opcionales de filtrado y ordenamiento.\n"
            "Requiere autenticación con token JWT."
        ),
        parameters = [
            OpenApiParameter(
                name="sort",
                location=OpenApiParameter.QUERY,
                description="Ordenamiento: 'rating' para ordenar por promedio de valoraciones (opcional)",
                required=False,
                type=str,
                examples=[OpenApiExample("Ordenar por rating", value="rating")]
            ),
            OpenApiParameter(
                name="category",
                location=OpenApiParameter.QUERY,
                description="Filtrar por ID de categoría (opcional)",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="author",
                location=OpenApiParameter.QUERY,
                description="Filtrar por ID de autor (opcional)",
                required=False,
                type=int,
            ),
            OpenApiParameter(
                name="page_size",
                location=OpenApiParameter.QUERY,
                description="Tamaño de la página (opcional, por defecto 10)",
                required=False,
                type=int,
                examples=[OpenApiExample("Tamaño de página", value=10)]
            ),
            OpenApiParameter(
                name="page",
                location=OpenApiParameter.QUERY,
                description="Número de página (opcional, por defecto 1)",
                required=False,
                type=int,
                examples=[OpenApiExample("Número de página", value=1)]
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=PostSerializer(many=True),
                description="Lista de publicaciones obtenidas exitosamente o una publicación específica."
            ),
            404: OpenApiResponse(
                description="No se encontró la publicación, usuario o categoría especificada."
            ),
            500: OpenApiResponse(
                description="Error interno del servidor al obtener las publicaciones."
            ),
        },
        tags=["Publicaciones"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def get(self, request):
        """
        Obtener publicaciones o una publicación por ID
        """
        try:
            posts = self._get_posts_queryset()

            if request.query_params.get('sort') == 'rating':
                from django.db.models import Avg, F

                posts = posts.annotate(
                    # Calcular promedio de los 5 aspectos
                    avg_rating = Avg(
                        (F('ratings__composition') +
                         F('ratings__clarity_focus') +
                         F('ratings__lighting') +
                         F('ratings__creativity') +
                         F('ratings__technical_adaptation')) / 5.0
                    )
                ).order_by(
                    # Primero ordenar por si tiene rating o no (posts con rating primero)
                    F('avg_rating').desc(nulls_last=True),
                    # Luego por promedio de rating descendente (mejor rating primero)
                    '-avg_rating',
                    # Finalmente por fecha descendente (más recientes primero) para posts sin rating
                    '-uploaded_at'
                )

            posts = self._apply_filters(posts, request)

            paginator = PostPagination()
            result_page = paginator.paginate_queryset(posts, request)
            serializer = PostSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)
        except AppUser.DoesNotExist as e:
            return Response({"success": False, "message": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Category.DoesNotExist as e:
            return Response({"success": False, "message": str(e)}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"success": False, "message": "No se pudieron obtener las publicaciones.", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    # --- Método POST para crear una publicación nueva
    @extend_schema(
        operation_id="api_posts_create",
        summary="Crear una nueva publicación",
        description=(
            "Crea una nueva publicación incluyendo una imagen y otros datos "
            "proporcionados en el cuerpo de la solicitud. \n"
            "Requiere autenticación con token JWT."
        ),
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "image": {"type": "file", "format": "binary"},
                    "title": {"type": "string", "example": "Título"},
                    "description": {"type": "string", "example": "Descripción"},
                    "category": {"type": "integer", "example": 1},
                    "allows_ratings": {"type": "boolean", "example": True},
                },
                "required": ["image", "category", "allows_ratings"],
            }
        },
        responses={
            201: OpenApiResponse(
                response=PostSerializer,
                description="Publicación creada exitosamente"
            ),
            400: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error de validación"},
                    "errors": {"type": "object"},
                },
                "description": "Error de validación"
            },
            500: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error interno del servidor"},
                },
                "description": "Error interno del servidor"
            }},
        tags=["Publicaciones"],
        auth=[{
            "jwtAuth":[]
        }],
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


class PostDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PostSerializer

    # --- Método GET para obtener una publicación por ID
    @extend_schema(
        operation_id="api_posts_retrieve",
        summary="Obtener una publicación por ID",
        description=(
            "Obtiene una publicación específica proporcionando su ID (`pk`). \n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID de la publicación a obtener",
                required=True,
                type=int,
            ),
        ],
        responses={
            200: OpenApiResponse(
                response=PostSerializer,
                description="Publicación obtenida exitosamente"
            ),
            404: OpenApiResponse(
                description="No se encontró la publicación especificada"
            ),
            500: OpenApiResponse(
                description="Error interno del servidor al obtener la publicación"
            ),
        },
        tags=["Publicaciones"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def get(self, request, pk):
        """
        Obtener una publicación por ID
        """
        try:
            post = Post.objects.get(id=pk)
            serializer = PostSerializer(post)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({"success": False, "message": "Publicación no encontrada"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"success": False, "message": "Error interno del servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # --- Método PUT para actualizar una publicación por ID
    @extend_schema(
        operation_id="api_posts_update",
        summary="Editar una publicación",
        description=(
            "Actualiza una publicación existente proporcionando su ID (`pk`) y los datos a modificar. "
            "Solo el autor de la publicación puede editarla.\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID de la publicación a actualizar",
                required=True,
                type=int,
            )
        ],
        request = PostSerializer,
        responses = {
            200: OpenApiResponse(
                response=PostSerializer,
                description="Publicación actualizada exitosamente."
            ),
            400: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error de validación"},
                    "errors": {"type": "object"},
                },
                "description": "Error de validación"
            },
            403: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "No tienes permisos para editar esta publicación."},
                },
                "description": "El usuario no tiene permisos para editar esta publicación."
            },
            404: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Publicación no encontrada."},
                },
                "description": "No existe publicación con el ID especificado."
            },
            500: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error interno del servidor."},
                },
                "description": "Error interno del servidor."
            },
        },
        tags=["Publicaciones"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def put(self, request, pk):
        """
        Actualizar una publicación existente
        """
        logger = logging.getLogger('posts')

        try:
            post = Post.objects.get(id=pk)
            if post.author != request.user:
                return Response({"success":False, "message": "No puedes editar este post."}, status=status.HTTP_403_FORBIDDEN)

            serializer = PostSerializer(post, data=request.data, partial=True, context={'request': request})

            if serializer.is_valid():
                serializer.save()
                
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


    # --- Método DELETE para borrar publicación
    @extend_schema(
        operation_id="api_posts_destroy",
        summary="Eliminar una publicación",
        description=(
            "Elimina una publicación existente proporcionando su ID (`pk`). "
            "Solo el autor de la publicación puede eliminarla.\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID de la publicación a eliminar",
                required=True,
                type=int,
            )
        ],
        responses = {
            200: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": True},
                    "message": {"type": "string", "example": "Publicación eliminada correctamente"},
                },
                "description": "Publicación eliminada exitosamente."
            },
            403: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "No puedes eliminar este post."},
                },
                "description": "El usuario no tiene permisos para eliminar esta publicación."
            },
            404: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Publicación no encontrada."},
                },
                "description": "No existe publicación con el ID especificado."
            },
            500: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error interno del servidor."},
                },
                "description": "Error interno del servidor."
            },
        },
        tags=["Publicaciones"],
        auth=[{
            "jwtAuth":[]
        }],
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


class DescriptionSuggestionView(APIView):
    permission_classes = [IsAuthenticated]
    
    @extend_schema(
        summary="Sugerir descripciones para una publicación",
        description=(
            "Recibe una imagen y devuelve tres sugerencias de descripciones generadas por Gemini AI.\n"
            "Requiere autenticación con token JWT."
        ),
        request= {
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "image": {
                        "type": "string",
                        "format": "binary",
                        "description": "Imagen a analizar (archivo JPG, PNG o WebP)."
                    }
                },
                "required": ["image"]
            }
        },
        responses={
            200: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": True},
                    "data": {"type": "object", "properties":{
                        "contenido_generado": {"type": "object", "properties":{
                            "lenguaje_tecnico_imagen": {"type": "string", "example": "..."},
                            "lenguaje_natural_imagen": {"type": "string", "example": "..."},
                            "lenguaje_natural_ameno_imagen": {"type": "string", "example": "..."},
                        }},
                    }},
                },
                "description": "Sugerencias de descripciones generadas exitosamente."
            },
            400: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error de validación"},
                },
                "description": "Error de validación"
            },
            500: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error interno del servidor"},
                },
                "description": "Error interno del servidor o respuesta de Gemini no válida."
            },
        },
        tags=["Descripciones de imágenes con Gemini AI"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def post(self, request):
        """
        Sugerir descripciones para una publicación
        """
        # Validar envío de imagen
        image = request.FILES.get('image')
        if not image:
            return Response({"success": False, "message": "No se envió ninguna imagen"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validar formato y tamaño de la imagen antes de enviar a la IA
        from utils.image_validation import validate_post_image
        is_valid, error_message = validate_post_image(image)
        if not is_valid:
            return Response({"success": False, "message": error_message}, status=status.HTTP_400_BAD_REQUEST)
        
        image.seek(0)

        try:
            image_bytes = image.read()

            from .prompts.description_prompt import IMAGE_DESCRIPTION_PROMPT

            # Llamada a Gemini
            result = settings.GEMINI_MODEL.generate_content([{"mime_type": "image/jpeg", "data": image_bytes}, IMAGE_DESCRIPTION_PROMPT])

            # Obtener el texto devuelto y parsear JSON
            clean_response_text = result.text.replace("```json", "").replace("```", "").strip()

            data = json.loads(clean_response_text)

            return Response({"success": True, "data": data}, status=status.HTTP_200_OK)

        except json.JSONDecodeError:
            return Response({"success": False, "message": "La respuesta de Gemini no fue un JSON válido."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            return Response({"success": False, "message": "No se pudo completar la petición.", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
   
# Vista para agregar comentarios a un post   
class PostCommentView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Agregar un comentario a una publicación",
        description=(
            "Agrega un comentario a una publicación existente proporcionando su ID (`post_id`).\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="post_id",
                location=OpenApiParameter.PATH,
                description="ID de la publicación a la que se agregará el comentario",
                required=True,
                type=int,
            ),
        ],
        request=CommentListSerializer,
        responses={
            201: OpenApiResponse(
                response=CommentListSerializer,
                description="Comentario agregado exitosamente."
            ),
            400: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "El campo 'content' es requerido."},
                },
                "description": "Error de validación"
            },
            404: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Post no encontrado."},
                },
                "description": "No se encontró la publicación especificada."
            },
            500: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor."},
                },
                "description": "Error interno del servidor al agregar el comentario."
            },
        },
        tags=["Comentarios"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def post(self, request, post_id):
        """
        Agregar un comentario a una publicación
        """
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return Response({
                "success": False,
                "message": "Post no encontrado."
            }, status=status.HTTP_404_NOT_FOUND)
        
        content_text = request.data.get("content")
        if not content_text:
            return Response({
                "success": False,
                "message": "El campo 'content' es requerido."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            comment = PostComment.objects.create(
                post=post,
                author=request.user, 
                content=content_text
            )
            
            serializer = CommentListSerializer(comment)
            return Response({
                "success": True,
                "data": serializer.data
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response({
                "success": False,
                "message": "Error del servidor."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)       

    @extend_schema(
        summary="Obtener todos los comentarios de una publicación",
        description=(
            "Obtiene todos los comentarios de una publicación existente proporcionando su ID (`post_id`).\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="post_id",
                location=OpenApiParameter.PATH,
                description="ID de la publicación de la que se obtienen los comentarios",
                required=True,
                type=int,
            )
        ],
        responses={
            200: OpenApiResponse(
                response=CommentListSerializer(many=True),
                description="Lista paginada de comentarios."
            ),
            404: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Post no encontrado."},
                },
                "description": "No se encontró la publicación especificada."
            },
            500: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor."},
                },
                "description": "Error interno del servidor al obtener los comentarios."
            },
        },
        tags=["Comentarios"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def get(self, request, post_id):
        """
        Obtener todos los comentarios de una publicación
        """
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return Response({
                "success": False,
                "message": "Post no encontrado."
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            comments = PostComment.objects.filter(post=post).order_by('-created_at')
            paginator = PostPagination()
            result_page = paginator.paginate_queryset(comments, request)
            # SERIALIZAR la lista de comentarios
            serializer = CommentListSerializer(result_page, many=True)
            return paginator.get_paginated_response(serializer.data)

        except Exception as e:
            return Response({
                "success": False,
                "message": "Error del servidor."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)   
            
class PostCommentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Eliminar un comentario de una publicación",
        description=(
            "Elimina un comentario específico de un post, verificando que:\n"
            "- El post exista\n"
            "- El comentario exista y pertenezca al post\n"
            "- El usuario autenticado sea el autor del comentario\n\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="post_id",
                location=OpenApiParameter.PATH,
                description="ID de la publicación a la que pertenece el comentario",
                required=True,
                type=int,
            ),
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID del comentario a eliminar",
                required=True,
                type=int,
            ),
        ],
        responses={
            200: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": True},
                    "data": {
                        "type": "object",
                        "properties":{
                            "message": {"type": "string", "example": "Comentario eliminado correctamente."},
                        },
                    },
                },
                "description": "Comentario eliminado exitosamente."
            },
            403: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "No tienes permiso para eliminar este comentario."},
                },
                "description": "El usuario no tiene permisos para eliminar este comentario."
            },
            404: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Comentario no encontrado."},
                },
                "description": "No se encontró el comentario o la publicación."
            },
            500: {
                "type": "object",
                "properties":{
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor."},
                },
                "description": "Error interno del servidor al eliminar el comentario."
            },
        },
        tags=["Comentarios"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def delete(self, request, post_id, pk):
        """
        Elimina un comentario por su ID, verificando autoría y existencia de Post.
        """
        try:
            # Verificar que el post exista primero
            Post.objects.get(pk=post_id) 
        except Post.DoesNotExist:
            return Response({
                "success": False, 
                "message": "Publicación no encontrada."
            }, status=status.HTTP_404_NOT_FOUND)

        try:
            # Obtener el comentario, verificando que pertenezca a ese post
            comment = PostComment.objects.get(pk=pk, post_id=post_id)
        except PostComment.DoesNotExist:
            return Response({
                "success": False,
                "message": "Comentario no encontrado."
            }, status=status.HTTP_404_NOT_FOUND)

        # Validar que el usuario autenticado sea el autor
        if comment.author != request.user:
            return Response({
                "success": False,
                "message": "No tienes permiso para eliminar este comentario."
            }, status=status.HTTP_403_FORBIDDEN)

        # Eliminación exitosa
        try:
            comment.delete()
            
            return Response({
                "success": True,
                "data": {"message": "Comentario eliminado correctamente."}
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({
                "success": False,
                "message": f"Error interno del servidor: {str(e)}" 
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
  

    @extend_schema(
        summary="Editar un comentario de una publicación",
        description=(
            "Permite modificar el contenido de un comentario específico de un post.\n"
            "Verifica que:\n"
            "- El post exista\n"
            "- El comentario exista\n"
            "- El usuario autenticado sea el autor del comentario\n\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="post_id",
                location=OpenApiParameter.PATH,
                description="ID del post al que pertenece el comentario",
                required=True,
                type=int,
            ),
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID del comentario a editar",
                required=True,
                type=int,
            ),
        ],
        request=CommentListSerializer,
        responses={
            200: OpenApiResponse(
                response=CommentListSerializer,
                description="Comentario actualizado correctamente"
            ),
            400: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "El campo 'content' es requerido."}
                },
                "description": "Falta el campo obligatorio 'content'",
            },
            403: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "No puedes editar este comentario."}
                },
                "description": "Usuario no autorizado para editar el comentario",
            },
            404: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Publicación no encontrada."}
                },
                "description": "El post o el comentario no existen",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor"}
                },
                "description": "Error interno del servidor al editar el comentario",
            },
        },
        tags=["Comentarios"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def put(self, request, post_id, pk):
        """
        Modificar un comentario específico de una publicación
        """
        # Verificar que el post existe
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return Response({
                "success": False,
                "message": "Publicación no encontrada."
            }, status=status.HTTP_404_NOT_FOUND)
        
        try:
            comment = PostComment.objects.get(pk=pk)
        except PostComment.DoesNotExist:
            return Response({
                "success": False,
                "message": "Comentario no encontrado."
            }, status=status.HTTP_404_NOT_FOUND)

        if comment.author != request.user:
            return Response({
                "success": False,
                "message": "No puedes editar este comentario."
            }, status=status.HTTP_403_FORBIDDEN)

        content_text = request.data.get("content")
        if not content_text:
            return Response({
                "success": False,
                "message": "El campo 'content' es requerido."
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            comment.content = content_text
            comment.save()
            serializer = CommentListSerializer(comment)
            return Response({
                "success": True,
                "data": serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                "success": False,
                "message": "Error del servidor."
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)        

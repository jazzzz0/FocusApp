from drf_spectacular.utils import OpenApiParameter, extend_schema, OpenApiResponse
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from posts.models import Post
from .serializers import RatingSerializer
from .models import Rating

import logging

class RatingListCreateView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RatingSerializer

    @extend_schema(
        operation_id="api_ratings_create",
        summary="Crear valoración de publicación",
        description=(
            "Permite crear una nueva valoración para una publicación existente.\n"
            "El usuario no puede valorar su propia publicación ni valorar la misma publicación más de una vez.\n"
            "Requiere autenticación con token JWT."
        ),
        request=RatingSerializer,
        responses={
            201: OpenApiResponse(
                response=RatingSerializer,
                description="Valoración creada correctamente"
            ),
            400: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error de validación"},
                    "errors": {"type": "object", "description": "Errores detallados del serializer"}
                },
                "description": "Error de validación o campos inválidos",
            },
            404: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "La publicación no existe"}
                },
                "description": "No se encontró la publicación indicada",
            },
            409: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Ya has valorado esta publicación"}
                },
                "description": "El usuario ya valoró esta publicación",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error interno del servidor"}
                },
                "description": "Error interno del servidor",
            },
        },
        tags=["Valoraciones"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def post(self, request, *args, **kwargs):
        """
        Crear una nueva valoración para una publicación.
        """
        serializer = RatingSerializer(data=request.data)

        if serializer.is_valid():
            try:
                post_id = request.data.get('post')

                if post_id is None:
                    return Response(
                        {"success": False, "message": "El campo 'post' es requerido."}, status=status.HTTP_400_BAD_REQUEST
                    )
                
                post = Post.objects.get(id=post_id)

            except (ValueError, TypeError):
                # Captura si el ID no es un número válido
                return Response(
                    {"success": False, "message": "El ID de la publicación es inválido."}, status=status.HTTP_400_BAD_REQUEST
                )

            except Post.DoesNotExist:
                # Captura si el ID es un número válido pero no existe
                return Response(
                    {"success": False, "message": "La publicación no existe."}, status=status.HTTP_404_NOT_FOUND
                )

            try:
                # Validaciones de negocio
                user = request.user
                if not post.allows_ratings:
                    return Response({"success": False, "message": "Esta publicación no permite valoraciones."}, status=status.HTTP_400_BAD_REQUEST)
                
                if user == post.author:
                    return Response({"success": False, "message": "No puedes valorar tu propia publicación."}, status=status.HTTP_400_BAD_REQUEST)
                
                if Rating.objects.filter(post=post, rater=user).exists():
                    return Response({"success": False, "message": "Ya has valorado esta publicación."}, status=status.HTTP_409_CONFLICT)
                
                serializer.save(rater=user, post=post)
                
                return Response({"success": True, "data": serializer.data}, status=status.HTTP_201_CREATED)
            
            except Exception:
                return Response({"success": False, "message": "Error interno del servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response(
            {"success": False, "message": "Error de validación", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST
        )

    @extend_schema(
        operation_id="api_ratings_get_by_post",
        summary="Obtener valoración de un post por el usuario",
        description=(
            "Obtiene la valoración de un post realizada por el usuario autenticado.\n"
            "Se requiere el parámetro de consulta 'post_id'.\n"
            "Si el usuario no ha valorado el post, se devuelve `success: False`.\n"
            "No permite que el autor valore su propia publicación."
        ),
        parameters=[
            OpenApiParameter(
                name="post_id",
                description="ID del post a consultar",
                required=True,
                type=int,
                location=OpenApiParameter.QUERY,
            ),
        ],
        responses={
            200: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": True},
                    "data": {"type": "object", "nullable": True, "description": "Datos de la valoración si existe"},
                    "message": {"type": "string", "example": "El usuario no ha valorado esta publicación", "nullable": True}
                },
                "description": "Valoración obtenida o mensaje indicando que no hay valoración",
            },
            400: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "El parámetro 'post_id' es requerido."}
                },
                "description": "Error en parámetros de consulta",
            },
            403: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "No puedes valorar tu propia publicación"}
                },
                "description": "El usuario es el autor del post",
            },
            404: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Post no encontrado."}
                },
                "description": "No se encontró el post indicado",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error interno del servidor"}
                },
                "description": "Error interno del servidor",
            },
        },
        tags=["Valoraciones"],
        auth=[{"jwtAuth":[]}],
    )
    def get(self, request, *args, **kwargs):
        """
            Obtener la valoración de un post hecha por el usuario autenticado para
            pre-poblar el formulario de valoración si el usuario ya ha puntuado el post.
            Si no se valoró la publicación, se devuelve un objeto vacío. 
            Requiere el parámetro de consulta 'post_id'.
            Si llega 'success': true, el frontend deberá mostrar las estrellas de valoración.
        """
        logger = logging.getLogger('ratings')

        post_id = request.query_params.get('post_id')
        if not post_id:
            return Response({"success": False, "message": "El parámetro 'post_id' es requerido."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Obtener post y usuario autenticado
            post = Post.objects.get(id=post_id)

            user = request.user

            if post.author == user:
                return Response({"success": False, "message": "No puedes valorar tu propia publicacipon"}, status=status.HTTP_403_FORBIDDEN)

            # Buscar la valoración específica con índice compuesto
            rating = Rating.objects.get(post=post, rater=user)

            serializer = self.serializer_class(rating)

            logger.info(f"Valoración obtenida: Rater {rating.rater} - Post ID {rating.post} - Valoración {serializer.data}")
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

        # Si el Rating no existe se devuelve success: false
        except Rating.DoesNotExist:
            logger.info(f"Usuario {user} no ha valorado el post ID {post_id}")
            return Response({"success": False, "message": "El usuario no ha valorado esta publicación"}, status=status.HTTP_200_OK)

        except Post.DoesNotExist:
            logger.warning(f"No se puede obtener la valoración de un post inexistente.")
            return Response({"success": False, "message": "Post no encontrado."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error al obtener los ratings del post {post_id}: {str(e)}")
            return Response({"success": False, "message": "Error interno del servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        

class RatingDetailView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RatingSerializer

    @extend_schema(
        operation_id="api_ratings_update",
        summary="Actualizar valoración",
        description=(
            "Permite actualizar una valoración existente por su ID.\n"
            "Solo el usuario que creó la valoración puede actualizarla y solo dentro de las primeras 24 horas.\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="id",
                description="ID de la valoración a actualizar",
                required=True,
                type=int,
                location=OpenApiParameter.PATH,
            )
        ],
        request=RatingSerializer,
        responses={
            200: OpenApiResponse(
                response=RatingSerializer,
                description="Valoración actualizada correctamente"
            ),
            400: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error de validación"},
                    "errors": {"type": "object", "description": "Errores detallados del serializer"}
                },
                "description": "Error de validación o restricciones de edición",
            },
            403: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "No puedes actualizar esta valoración."}
                },
                "description": "El usuario no es el autor de la valoración",
            },
            404: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Valoración no encontrada."}
                },
                "description": "No se encontró la valoración indicada",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error interno del servidor"}
                },
                "description": "Error interno del servidor",
            },
        },
        tags=["Valoraciones"],
        auth=[{
            "jwtAuth":[]
        }],
    )
    def put(self, request, pk, *args, **kwargs):
        """
        Actualiza una valoración existente por su ID.
        """

        logger = logging.getLogger('ratings')

        try:
            rating = Rating.objects.get(pk=pk)
            
            if rating.rater != request.user:
                return Response({"success": False, "message": "No puedes actualizar esta valoración."}, status=status.HTTP_403_FORBIDDEN)
            
            if not rating.can_be_edited():
                return Response({"success": False, "message": "Solo puede actualizar la valoración durante las primeras 24 horas."}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = RatingSerializer(rating, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()

                logger.info(f"Valoración actualizada: Valorador {rating.rater} - Post ID: {rating.post.id} - Campos modificados: {list(request.data.keys())}")

                return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)

            else:
                logger.warning(f"Error de validación al actualizar la valoración ID {pk}: {serializer.errors}")
                return Response({"success": False, "message": "Error de validación", "errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        except Rating.DoesNotExist:
            logger.warning(f"No se puede actualizar una valoración inexistente")
            return Response({"success": False, "message": "Valoración no encontrada."}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            logger.error(f"Error al actualizar la valoración ID {pk}: {str(e)}")
            return Response({"success": False, "message": "Error interno del servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class PostRatingsView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="api_posts_ratings_average",
        summary="Obtener promedio de valoraciones de un post",
        description=(
            "Devuelve el promedio de cada aspecto evaluado y el promedio general de las valoraciones de una publicación.\n"
            "Incluye también el total de valoraciones.\n"
            "Si el post no tiene valoraciones, devuelve 0 en todos los campos."
        ),
        parameters=[
            OpenApiParameter(
                name="post_id",
                description="ID del post para calcular el promedio de valoraciones",
                required=True,
                type=int,
                location=OpenApiParameter.PATH
            )
        ],
        responses={
            200: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": True},
                    "data": {
                        "type": "object",
                        "properties": {
                            "composition": {"type": "number", "example": 4.5},
                            "clarity_focus": {"type": "number", "example": 4.0},
                            "lighting": {"type": "number", "example": 3.5},
                            "creativity": {"type": "number", "example": 5.0},
                            "technical_adaptation": {"type": "number", "example": 4.0},
                            "overall": {"type": "number", "example": 4.2},
                            "total_ratings": {"type": "integer", "example": 12}
                        }
                    }
                },
                "description": "Promedio de valoraciones del post"
            },
            404: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Post no encontrado."}
                },
                "description": "El post indicado no existe"
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error interno del servidor"}
                },
                "description": "Error inesperado en el servidor"
            }
        },
        tags=["Valoraciones"],
    )
    def get(self, request, post_id):
        """
        Obtener el promedio de valoraciones de una publicación
        """

        logger = logging.getLogger('ratings')

        try:
            post = Post.objects.get(id=post_id)

            averages = Rating.get_post_averages(post)

            if averages is None:
                data = {
                    'composition': 0.0,
                    'clarity_focus': 0.0,
                    'lighting': 0.0,
                    'creativity': 0.0,
                    'technical_adaptation': 0.0,
                    'overall': 0.0,
                    'total_ratings': 0.0,
                }
            
            else:
                data = averages

            logger.info(f"\n-------------------------------- \nPromedio de valoraciones obtenido: \n{data} \n--------------------------------")
            return Response({"success": True, "data": data}, status=status.HTTP_200_OK)
        
        except Post.DoesNotExist:
            logger.warning(f"No se pueden obtener el promedio de un post inexistente.")
            return Response({"success": False, "message": "Post no encontrado."}, status=status.HTTP_404_NOT_FOUND)


        except Exception as e:
            logger.error(f"Error al obtener los ratings del post {post_id}: {str(e)}")
            return Response({"success": False, "message": "Error interno del servidor"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
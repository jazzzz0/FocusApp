from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from posts.models import Post
from .serializers import RatingSerializer
from .models import Rating

import logging

class RatingView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RatingSerializer

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
        

    def patch(self, request, pk, *args, **kwargs):
        return self.put(request, pk, *args, **kwargs)

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


class PostRatingsView(APIView):
    permission_classes = [AllowAny]

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
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from posts.models import Post
from .serializers import RatingSerializer
from .models import Rating

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
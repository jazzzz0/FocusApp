from django.shortcuts import render
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, UserProfileSerializer
from .models import AppUser

# Create your views here.

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    # Documentación para API de registro de usuario
    @extend_schema(request=UserSerializer, responses={201: UserSerializer}, description="Registrar nuevo usuario.")
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        request={"refresh": OpenApiTypes.STR},
        responses={
            205: None,
            400: None
        },
        description="Endpoint para cerrar sesión."
    )
    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Sesión cerrada correctamente."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": "Error al cerrar sesión. Token inválido."}, status=status.HTTP_400_BAD_REQUEST)


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, username):
        try:
            user = AppUser.objects.get(username=username)
            serializer = UserProfileSerializer(user)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except AppUser.DoesNotExist:
            return Response({"success": False, "message": "Usuario no encontrado"}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"success": False, "message": "No se pudo obtener el usuario", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            

from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiParameter
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)
from django.contrib.auth import authenticate
from .serializers import UserSerializer, UserProfileSerializer
from .models import AppUser

import logging

logger = logging.getLogger(__name__)


class SingleSessionTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada que implementa sesión única.
    Invalida todos los tokens anteriores del usuario antes de generar nuevos tokens.
    """

    permission_classes = [AllowAny]

    @extend_schema(
        summary="Obtener tokens JWT con sesión única. Endpoitn para iniciar sesión.",
        description=(
            "Genera un par de tokens JWT (access y refresh) para un usuario.\n"
            "Antes de emitir nuevos tokens, invalida todos los tokens anteriores del usuario.\n"
            "No requiere autenticación previa."
        ),
        request={
            "application/json": {
                "type": "object",
                "properties": {
                    "username": {
                        "type": "string",
                        "description": "Nombre del usuario a autenticar.",
                        "example": "juan.perez",
                    },
                    "password": {
                        "type": "string",
                        "description": "Contraseña del usuario a autenticar.",
                        "example": "password4567",
                    },
                },
                "required": ["username", "password"],
            }
        },
        responses={
            200: {
                "type": "object",
                "properties": {
                    "access": {"type": "string", "example": "token.access.jwt"},
                    "refresh": {"type": "string", "example": "token.refresh.jwt"},
                },
                "description": "Tokens JWT generados exitosamente.",
            },
            400: {
                "type": "object",
                "properties": {
                    "detail": {
                        "type": "string",
                        "example": "Se requieren username y password",
                    },
                },
                "description": "Se requieren username y password.",
            },
            401: {
                "type": "object",
                "properties": {
                    "detail": {"type": "string", "example": "Credenciales inválidas"},
                },
                "description": "Credenciales inválidas.",
            },
            500: {
                "type": "object",
                "properties": {
                    "detail": {
                        "type": "string",
                        "example": "Error interno del servidor.",
                    },
                },
                "description": "Error interno del servidor.",
            },
        },
        tags=["Usuarios"],
    )
    def post(self, request, *args, **kwargs):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"detail": "Se requieren username y password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Autenticar usuario
        user = authenticate(username=username, password=password)

        if not user:
            return Response(
                {"detail": "Credenciales inválidas"},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        # Invalidar todos los tokens anteriores del usuario
        self._invalidate_user_tokens(user)

        # Generar nuevos tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        # Guardar tokens en OutstandingToken manualmente
        self._save_tokens_to_outstanding(user, refresh, access)

        return Response(
            {
                "access": str(access),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK,
        )

    def _invalidate_user_tokens(self, user):
        """
        Invalida todos los tokens activos del usuario agregándolos a la blacklist.
        """
        try:
            # Obtener todos los tokens pendientes del usuario
            outstanding_tokens = OutstandingToken.objects.filter(user=user)

            # Agregar cada token a la blacklist
            for token in outstanding_tokens:
                BlacklistedToken.objects.get_or_create(token=token)

        except Exception as e:
            logger.warning(f"Error al invalidar tokens del usuario {user.username}: {str(e)}")

    def _save_tokens_to_outstanding(self, user, refresh_token, access_token):
        """
        Guarda los tokens en OutstandingToken para poder hacer blacklist después.
        """
        try:
            from rest_framework_simplejwt.token_blacklist.models import OutstandingToken
            from django.utils import timezone

            # Convertir timestamps a datetime con zona horaria
            def timestamp_to_datetime(timestamp):
                if timestamp:
                    from datetime import datetime

                    return datetime.fromtimestamp(timestamp, tz=timezone.get_current_timezone())
                return None

            # Guardar refresh token
            OutstandingToken.objects.get_or_create(
                jti=refresh_token.get("jti"),
                defaults={
                    "user": user,
                    "token": str(refresh_token),
                    "created_at": timestamp_to_datetime(refresh_token.get("iat")),
                    "expires_at": timestamp_to_datetime(refresh_token.get("exp")),
                },
            )

            # Guardar access token
            OutstandingToken.objects.get_or_create(
                jti=access_token.get("jti"),
                defaults={
                    "user": user,
                    "token": str(access_token),
                    "created_at": timestamp_to_datetime(access_token.get("iat")),
                    "expires_at": timestamp_to_datetime(access_token.get("exp")),
                },
            )

        except Exception as e:
            logger.warning(f"Error al guardar tokens del usuario {user.username}: {str(e)}")


class RegisterView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        summary="Registrar nuevo usuario",
        description="Registra un nuevo usuario en la aplicación.",
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "example": "juan.perez"},
                    "email": {"type": "string", "example": "juan.perez@gmail.com"},
                    "password": {"type": "string", "example": "password4567"},
                    "date_of_birth": {"type": "string", "example": "2000-01-01"},
                    "first_name": {"type": "string", "example": "Juan"},
                    "last_name": {"type": "string", "example": "Perez"},
                    "profile_pic": {"type": "file", "format": "binary"},
                    "bio": {"type": "string"},
                },
                "required": ["username", "email", "password", "date_of_birth"],
            }
        },
        responses={
            201: OpenApiResponse(
                response=UserSerializer, description="Usuario creado exitosamente"
            ),
            400: {
                "type": "object",
                "properties": {
                    "username": {"type": "array", "items": {"type": "string"}},
                    "email": {"type": "array", "items": {"type": "string"}},
                    "password": {"type": "array", "items": {"type": "string"}},
                    "date_of_birth": {"type": "array", "items": {"type": "string"}},
                },
                "description": "Error de validación",
            },
            500: {
                "type": "object",
                "properties": {
                    "detail": {
                        "type": "string",
                        "example": "Error interno del servidor.",
                    },
                },
                "description": "Error interno del servidor.",
            },
        },
        tags=["Usuarios"],
    )
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Cerrar sesión",
        description=(
            "Cierra la sesión del usuario autenticado invalidando el token refresh.\n"
            "Se requiere enviar el refresh token en el body de la solicitud.\n"
            "Requiere autenticación con token JWT."
        ),
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "refresh": {
                        "type": "string",
                        "description": "Token refresh del usuario a cerrar sesión.",
                        "example": "token.refresh.jwt",
                    }
                },
                "required": ["refresh"],
            }
        },
        responses={
            205: {
                "type": "object",
                "properties": {
                    "detail": {
                        "type": "string",
                        "example": "Sesión cerrada correctamente.",
                    },
                },
                "description": "Sesión cerrada correctamente.",
            },
            400: {
                "type": "object",
                "properties": {
                    "detail": {
                        "type": "string",
                        "example": "Error al cerrar sesión. Token inválido.",
                    },
                },
                "description": "Error al cerrar sesión. Token inválido.",
            },
            500: {
                "type": "object",
                "properties": {
                    "detail": {
                        "type": "string",
                        "example": "Error interno del servidor.",
                    },
                },
                "description": "Error interno del servidor.",
            },
        },
        tags=["Usuarios"],
        auth=[{"jwtAuth": []}],
    )
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(
                {"detail": "Sesión cerrada correctamente."},
                status=status.HTTP_205_RESET_CONTENT,
            )
        except BlacklistedToken.DoesNotExist:
            return Response({"detail": "Token inválido."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response(
                {"detail": "Error al cerrar sesión: " + str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Obtener usuario autenticado",
        description=(
            "Devuelve la información del usuario actualmente autenticado.\n"
            "Requiere autenticación con token JWT."
        ),
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description="Usuario autenticado obtenido correctamente",
            ),
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {
                        "type": "string",
                        "example": "No se pudo obtener el usuario actual",
                    },
                    "detalle": {"type": "string", "example": "Detalle del error"},
                },
                "description": "Error interno del servidor",
            },
        },
        tags=["Autenticación"],
        auth=[{"jwtAuth": []}],
    )
    def get(self, request):
        """Obtener información del usuario autenticado actual"""
        try:
            serializer = UserProfileSerializer(request.user)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "No se pudo obtener el usuario actual",
                    "detalle": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Obtener usuario por username",
        description=(
            "Devuelve la información de un usuario específico dado su username.\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="username",
                location=OpenApiParameter.PATH,
                description="Nombre de usuario del usuario a consultar",
                required=True,
                type=str,
            )
        ],
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description="Usuario encontrado y devuelto correctamente",
            ),
            404: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Usuario no encontrado"},
                },
                "description": "No se encontró un usuario con ese username",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {
                        "type": "string",
                        "example": "No se pudo obtener el usuario",
                    },
                    "detalle": {"type": "string", "example": "Detalle del error"},
                },
                "description": "Error interno del servidor",
            },
        },
        tags=["Usuarios"],
        auth=[{"jwtAuth": []}],
    )
    def get(self, request, username):
        try:
            user = AppUser.objects.get(username=username)
            serializer = UserProfileSerializer(user)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except AppUser.DoesNotExist:
            return Response(
                {"success": False, "message": "Usuario no encontrado"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "No se pudo obtener el usuario",
                    "detalle": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UpdateUserView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Actualizar usuario autenticado",
        description=(
            "Permite actualizar los datos del usuario actualmente autenticado.\n"
            "Requiere autenticación con token JWT."
        ),
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "username": {"type": "string", "example": "juan.perez"},
                    "profile_pic": {"type": "file", "format": "binary"},
                    "first_name": {"type": "string", "example": "Juan"},
                    "last_name": {"type": "string", "example": "Perez"},
                    "bio": {"type": "string"},
                },
            }
        },
        responses={
            200: OpenApiResponse(
                response=UserProfileSerializer,
                description="Usuario actualizado correctamente",
            ),
            400: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error de validación"},
                    "errors": {
                        "type": "object",
                        "description": "Errores detallados del serializer",
                    },
                },
                "description": "Error de validación o archivo no válido",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {
                        "type": "string",
                        "example": "No se pudo actualizar el usuario",
                    },
                    "detalle": {"type": "string", "example": "Detalle del error"},
                },
                "description": "Error interno del servidor",
            },
        },
        tags=["Usuarios"],
        auth=[{"jwtAuth": []}],
    )
    def put(self, request):

        # TODO: Eliminar la doble validaciónd de imagenes ya que se hace con image_validation.py
        try:
            user = request.user

            # Validar foto de perfil si se proporciona
            if "profile_pic" in request.FILES:
                new_photo = request.FILES["profile_pic"]

                # Validar el tipo de archivo
                allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
                if new_photo.content_type not in allowed_types:
                    return Response(
                        {
                            "success": False,
                            "message": "Tipo de archivo no válido. Solo se permiten imágenes (JPEG, PNG, WebP)",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

                # Validar el tamaño del archivo (máximo 5MB)
                max_size = 5 * 1024 * 1024  # 5MB en bytes
                if new_photo.size > max_size:
                    return Response(
                        {
                            "success": False,
                            "message": "El archivo es demasiado grande. El tamaño máximo permitido es 5MB",
                        },
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            # Usar el serializer para actualizar el usuario
            serializer = UserProfileSerializer(
                user, data=request.data, partial=True, context={"request": request}
            )
            if serializer.is_valid():
                serializer.save()
                return Response(
                    {"success": True, "data": serializer.data},
                    status=status.HTTP_200_OK,
                )
            else:
                return Response(
                    {
                        "success": False,
                        "message": "Error de validación",
                        "errors": serializer.errors,
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except Exception as e:
            return Response(
                {
                    "success": False,
                    "message": "No se pudo actualizar el usuario",
                    "detalle": str(e),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

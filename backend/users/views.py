from django.shortcuts import render
from drf_spectacular.types import OpenApiTypes
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from django.contrib.auth import authenticate
from .serializers import UserSerializer, UserProfileSerializer
from .models import AppUser

# Create your views here.

class SingleSessionTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada que implementa sesión única.
    Invalida todos los tokens anteriores del usuario antes de generar nuevos tokens.
    """
    permission_classes = [AllowAny]

    @extend_schema(
        request={
            "username": OpenApiTypes.STR,
            "password": OpenApiTypes.STR
        },
        responses={
            200: {
                "access": OpenApiTypes.STR,
                "refresh": OpenApiTypes.STR
            },
            401: {"detail": OpenApiTypes.STR}
        },
        description="Iniciar sesión con sesión única. Invalida sesiones anteriores."
    )
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(
                {"detail": "Se requieren username y password"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Autenticar usuario
        user = authenticate(username=username, password=password)
        
        if not user:
            return Response(
                {"detail": "Credenciales inválidas"}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Invalidar todos los tokens anteriores del usuario
        self._invalidate_user_tokens(user)
        
        # Generar nuevos tokens
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        
        # Guardar tokens en OutstandingToken manualmente
        self._save_tokens_to_outstanding(user, refresh, access)
        
        return Response({
            'access': str(access),
            'refresh': str(refresh),
        }, status=status.HTTP_200_OK)
    
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
            # Log del error pero no fallar el login
            import logging
            logger = logging.getLogger(__name__)
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
                jti=refresh_token.get('jti'),
                defaults={
                    'user': user,
                    'token': str(refresh_token),
                    'created_at': timestamp_to_datetime(refresh_token.get('iat')),
                    'expires_at': timestamp_to_datetime(refresh_token.get('exp')),
                }
            )
            
            # Guardar access token
            OutstandingToken.objects.get_or_create(
                jti=access_token.get('jti'),
                defaults={
                    'user': user,
                    'token': str(access_token),
                    'created_at': timestamp_to_datetime(access_token.get('iat')),
                    'expires_at': timestamp_to_datetime(access_token.get('exp')),
                }
            )
            
        except Exception as e:
            # Log del error pero no fallar el login
            import logging
            logger = logging.getLogger(__name__)
            logger.warning(f"Error al guardar tokens del usuario {user.username}: {str(e)}")

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


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """Obtener información del usuario autenticado actual"""
        try:
            serializer = UserProfileSerializer(request.user)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"success": False, "message": "No se pudo obtener el usuario actual", "detalle": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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
            

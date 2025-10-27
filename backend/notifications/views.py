from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.core.exceptions import ValidationError
import logging

from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Obtener todas las notificaciones del usuario",
        description="Retorna todas las notificaciones del usuario autenticado, ordenadas de más recientes a más antiguas. Requiere autenticación con token JWT.",
        responses={
            200: OpenApiResponse(
                response=NotificationSerializer(many=True),
                description="Lista de notificaciones del usuario",
            ),
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor."},
                },
                "description": "Error interno del servidor al obtener las notificaciones.",
            },
        },
        tags=["Notificaciones"],
        auth=[{"jwtAuth": []}],
    )
    def get(self, request):
        try:
            notifications = Notification.objects.filter(recipient=request.user).order_by(
                "-created_at"
            )
            serializer = NotificationSerializer(notifications, many=True)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error inesperado al obtener notificaciones: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Error inesperado al obtener las notificaciones.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UnreadNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Obtener todas las notificaciones no leídas del usuario",
        description="Retorna todas las notificaciones no leídas del usuario autenticado, ordenadas de más recientes a más antiguas. Requiere autenticación con token JWT.",
        responses={
            200: OpenApiResponse(
                response=NotificationSerializer(many=True),
                description="Lista de notificaciones no leídas del usuario",
            ),
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor."},
                },
                "description": "Error interno del servidor al obtener las notificaciones no leídas.",
            },
        },
        tags=["Notificaciones"],
        auth=[{"jwtAuth": []}],
    )
    def get(self, request):
        try:
            notifications = Notification.objects.filter(
                recipient=request.user, is_read=False
            ).order_by("-created_at")
            serializer = NotificationSerializer(notifications, many=True)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error inesperado al obtener notificaciones no leídas: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Error inesperado al obtener las notificaciones no leídas.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UnreadNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Obtener el contador de notificaciones no leídas del usuario",
        description="Retorna el número de notificaciones no leídas del usuario autenticado. Requiere autenticación con token JWT.",
        responses={
            200: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": True},
                    "unread_count": {"type": "integer", "example": 10},
                },
                "description": "Contador de notificaciones no leídas del usuario",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor."},
                },
                "description": "Error interno del servidor al contar las notificaciones no leídas.",
            },
        },
        tags=["Notificaciones"],
        auth=[{"jwtAuth": []}],
    )
    def get(self, request):
        try:
            count = Notification.objects.filter(recipient=request.user, is_read=False).count()
            return Response({"success": True, "unread_count": count}, status=status.HTTP_200_OK)
        except Exception as e:
            logger.error(f"Error inesperado al contar notificaciones no leídas: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Error inesperado al contar las notificaciones no leídas.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    @extend_schema(
        summary="Marcar una notificación como leída",
        description=(
            "Marca como leída una notificación específica del usuario autenticado.\n"
            "Verifica que la notificación exista y pertenezca al usuario.\n"
            "Requiere autenticación con token JWT."
        ),
        parameters=[
            OpenApiParameter(
                name="id",
                location=OpenApiParameter.PATH,
                description="ID de la notificación a marcar como leída",
                required=True,
                type=int,
            ),
        ],
        responses={
            200: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": True},
                    "message": {
                        "type": "string",
                        "example": "Notificación marcada como leída.",
                    },
                },
                "description": "Notificación marcada como leída exitosamente.",
            },
            400: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {
                        "type": "string",
                        "example": "ID de notificación inválido.",
                    },
                },
                "description": "ID inválido para la notificación.",
            },
            404: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {
                        "type": "string",
                        "example": "Notificación no encontrada.",
                    },
                },
                "description": "No se encontró la notificación especificada.",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor."},
                },
                "description": "Error interno del servidor al marcar la notificación como leída.",
            },
        },
        tags=["Notificaciones"],
        auth=[{"jwtAuth": []}],
    )
    def patch(self, request, pk):
        try:
            # Validar que pk sea un número válido
            if not pk or not str(pk).isdigit():
                return Response(
                    {"success": False, "message": "ID de notificación inválido."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            notification = Notification.objects.get(pk=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response(
                {"success": True, "message": "Notificación marcada como leída."},
                status=status.HTTP_200_OK,
            )
        except Notification.DoesNotExist:
            return Response(
                {"success": False, "message": "Notificación no encontrada."},
                status=status.HTTP_404_NOT_FOUND,
            )
        except ValidationError as e:
            logger.error(f"Error de validación al marcar notificación como leída: {str(e)}")
            return Response(
                {"success": False, "message": "Datos de notificación inválidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            logger.error(f"Error inesperado al marcar notificación como leída: {str(e)}")
            return Response(
                {
                    "success": False,
                    "message": "Error inesperado al marcar la notificación como leída.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class MarkAllAsReadView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    @extend_schema(
        summary="Marcar todas las notificaciones como leídas",
        description=(
            "Marca todas las notificaciones no leídas del usuario autenticado como leídas.\n"
            "Requiere autenticación con token JWT."
        ),
        responses={
            200: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": True},
                    "message": {
                        "type": "string",
                        "example": "Se marcaron 5 notificaciones como leídas.",
                    },
                },
                "description": "Todas las notificaciones no leídas del usuario han sido marcadas como leídas.",
            },
            500: {
                "type": "object",
                "properties": {
                    "success": {"type": "boolean", "example": False},
                    "message": {"type": "string", "example": "Error del servidor."},
                },
                "description": "Error interno del servidor al marcar todas las notificaciones como leídas.",
            },
        },
        tags=["Notificaciones"],
        auth=[{"jwtAuth": []}],
    )
    def patch(self, request):
        try:
            notifications = Notification.objects.filter(recipient=request.user, is_read=False)
            updated_count = notifications.update(is_read=True)
            return Response(
                {
                    "success": True,
                    "message": f"Se marcaron {updated_count} notificaciones como leídas.",
                },
                status=status.HTTP_200_OK,
            )
        except Exception as e:
            logger.error(
                f"Error inesperado al marcar todas las notificaciones como leídas: {str(e)}"
            )
            return Response(
                {
                    "success": False,
                    "message": "Error inesperado al marcar todas las notificaciones como leídas.",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

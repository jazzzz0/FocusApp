from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db import DatabaseError
from django.core.exceptions import ValidationError
import logging

from .models import Notification
from .serializers import NotificationSerializer

logger = logging.getLogger(__name__)

class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
            serializer = NotificationSerializer(notifications, many=True)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except DatabaseError as e:
            logger.error(f"Error de base de datos al obtener notificaciones: {str(e)}")
            return Response(
                {"success": False, "message": "Error interno del servidor al obtener las notificaciones."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Error inesperado al obtener notificaciones: {str(e)}")
            return Response(
                {"success": False, "message": "Error inesperado al obtener las notificaciones."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UnreadNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            notifications = Notification.objects.filter(recipient=request.user, is_read=False).order_by('-created_at')
            serializer = NotificationSerializer(notifications, many=True)
            return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)
        except DatabaseError as e:
            logger.error(f"Error de base de datos al obtener notificaciones no leídas: {str(e)}")
            return Response(
                {"success": False, "message": "Error interno del servidor al obtener las notificaciones no leídas."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Error inesperado al obtener notificaciones no leídas: {str(e)}")
            return Response(
                {"success": False, "message": "Error inesperado al obtener las notificaciones no leídas."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class UnreadNotificationCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            count = Notification.objects.filter(recipient=request.user, is_read=False).count()
            return Response({"success": True, "unread_count": count}, status=status.HTTP_200_OK)
        except DatabaseError as e:
            logger.error(f"Error de base de datos al contar notificaciones no leídas: {str(e)}")
            return Response(
                {"success": False, "message": "Error interno del servidor al contar las notificaciones no leídas."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Error inesperado al contar notificaciones no leídas: {str(e)}")
            return Response(
                {"success": False, "message": "Error inesperado al contar las notificaciones no leídas."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarkAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            # Validar que pk sea un número válido
            if not pk or not str(pk).isdigit():
                return Response(
                    {"success": False, "message": "ID de notificación inválido."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            notification = Notification.objects.get(pk=pk, recipient=request.user)
            notification.is_read = True
            notification.save()
            return Response({"success": True, "message": "Notificación marcada como leída."}, status=status.HTTP_200_OK)
        except Notification.DoesNotExist:
            return Response(
                {"success": False, "message": "Notificación no encontrada."}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except ValidationError as e:
            logger.error(f"Error de validación al marcar notificación como leída: {str(e)}")
            return Response(
                {"success": False, "message": "Datos de notificación inválidos."}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        except DatabaseError as e:
            logger.error(f"Error de base de datos al marcar notificación como leída: {str(e)}")
            return Response(
                {"success": False, "message": "Error interno del servidor al marcar la notificación como leída."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Error inesperado al marcar notificación como leída: {str(e)}")
            return Response(
                {"success": False, "message": "Error inesperado al marcar la notificación como leída."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class MarkAllAsReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        try:
            notifications = Notification.objects.filter(recipient=request.user, is_read=False)
            updated_count = notifications.update(is_read=True)
            return Response(
                {"success": True, "message": f"Se marcaron {updated_count} notificaciones como leídas."}, 
                status=status.HTTP_200_OK
            )
        except DatabaseError as e:
            logger.error(f"Error de base de datos al marcar todas las notificaciones como leídas: {str(e)}")
            return Response(
                {"success": False, "message": "Error interno del servidor al marcar todas las notificaciones como leídas."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.error(f"Error inesperado al marcar todas las notificaciones como leídas: {str(e)}")
            return Response(
                {"success": False, "message": "Error inesperado al marcar todas las notificaciones como leídas."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

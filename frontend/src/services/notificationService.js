import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

class NotificationService {
  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}notifications`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para agregar el token de autenticación dinámicamente
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de respuesta
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          localStorage.removeItem('access');
          localStorage.removeItem('refresh');
          localStorage.removeItem('username');
          window.location.href = '/Login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Obtiene todas las notificaciones del usuario autenticado
   * @returns {Promise<Array>} Lista de notificaciones
   */
  async getAllNotifications() {
    try {
      const response = await this.api.get('/');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error al obtener notificaciones:', error);
      throw error;
    }
  }

  /**
   * Obtiene solo las notificaciones no leídas del usuario
   * @returns {Promise<Array>} Lista de notificaciones no leídas
   */
  async getUnreadNotifications() {
    try {
      const response = await this.api.get('/unread/');
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error al obtener notificaciones no leídas:', error);
      throw error;
    }
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   * @returns {Promise<number>} Número de notificaciones no leídas
   */
  async getUnreadCount() {
    try {
      const response = await this.api.get('/count/');
      return response.data.success ? response.data.unread_count : 0;
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
      return 0;
    }
  }

  /**
   * Marca una notificación específica como leída
   * @param {number} notificationId - ID de la notificación
   * @returns {Promise<boolean>} True si se marcó correctamente
   */
  async markAsRead(notificationId) {
    try {
      const response = await this.api.patch(`/mark-as-read/${notificationId}/`);
      return response.data.success;
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   * @returns {Promise<boolean>} True si se marcaron correctamente
   */
  async markAllAsRead() {
    try {
      const response = await this.api.patch('/mark-all-as-read/');
      return response.data.success;
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error);
      throw error;
    }
  }

  /**
   * Formatea una notificación para mostrar en la UI
   * @param {Object} notification - Notificación del backend
   * @returns {Object} Notificación formateada
   */
  formatNotification(notification) {
    return {
      id: notification.id,
      message: notification.message,
      type: notification.type,
      isRead: notification.is_read,
      createdAt: new Date(notification.created_at),
      actor: notification.actor,
      targetId: notification.target_id,
      targetType: notification.target_type,
    };
  }

  /**
   * Formatea la fecha de creación para mostrar en la UI
   * @param {Date} date - Fecha de creación
   * @returns {string} Fecha formateada
   */
  formatDate(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Hace un momento';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} día${days > 1 ? 's' : ''}`;
    } else {
      return date.toLocaleDateString('es-ES');
    }
  }
}

// Crear una instancia singleton del servicio
const notificationService = new NotificationService();

export default notificationService;

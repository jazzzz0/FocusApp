import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Snackbar, Alert, Tooltip, IconButton } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import notificationService from '../services/notificationService';
import '../styles/Navbar.css';

const NotificationBell = () => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [lastFetchTime, setLastFetchTime] = useState(0);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [isFetching, setIsFetching] = useState(false); // Controla si hay una petición en curso
  
  const { user, isLoggingOut } = useContext(AuthContext);
  const navigate = useNavigate();

  // Límite de tiempo entre peticiones (en milisegundos)
  const FETCH_THROTTLE_TIME = 10000; // 5 segundos

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  /**
   * Verifica si puede hacer una nueva petición basado en el tiempo transcurrido y estado de petición
   * @returns {boolean} True si puede hacer la petición, false si debe esperar
   */
  const canFetchNotifications = () => {
    // Si ya hay una petición en curso, no permitir otra
    if (isFetching) {
      return false;
    }
    
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    return timeSinceLastFetch >= FETCH_THROTTLE_TIME;
  };

  /**
   * Obtiene el tiempo restante hasta la próxima petición permitida
   * @returns {number} Tiempo restante en segundos
   */
  const getTimeUntilNextFetch = () => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime;
    const remainingTime = FETCH_THROTTLE_TIME - timeSinceLastFetch;
    return Math.max(0, Math.ceil(remainingTime / 1000));
  };

  /**
   * Obtiene el contador de notificaciones no leídas
   * Se ejecuta cuando se carga una nueva vista
   */
  const fetchUnreadCount = async () => {
    if (!user?.access) return;
    
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error al obtener contador de notificaciones:', error);
      setUnreadCount(0);
    }
  };

  /**
   * Obtiene todas las notificaciones del usuario
   * Se ejecuta solo cuando se hace clic o hover en la campana
   */
  const fetchNotifications = async () => {
    if (!user?.access) return;
    
    // Marcar que hay una petición en curso
    setIsFetching(true);
    setLoading(true);
    setError(null);
    
    try {
      const data = await notificationService.getAllNotifications();
      const formattedNotifications = data.map(notificationService.formatNotification);
      setNotifications(formattedNotifications);
      
      // Actualizar el contador de no leídas basado en las notificaciones cargadas
      const unreadNotifications = formattedNotifications.filter(notification => !notification.isRead);
      setUnreadCount(unreadNotifications.length);
      
      setLastFetchTime(Date.now()); // Actualizar timestamp de la última petición
    } catch (err) {
      setError('Error al cargar las notificaciones');
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
      setIsFetching(false); // Marcar que la petición terminó
    }
  };

  /**
   * Marca una notificación como leída
   */
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Actualizar el contador
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showSnackbar('Error al marcar la notificación como leída', 'error');
    }
  };

  /**
   * Marca todas las notificaciones como leídas
   */
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      // Actualizar el estado local
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Resetear el contador
      setUnreadCount(0);
      showSnackbar('Todas las notificaciones han sido marcadas como leídas', 'success');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      showSnackbar('Error al marcar todas las notificaciones como leídas', 'error');
    }
  };

  /**
   * Maneja el clic en una notificación
   */
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await handleMarkAsRead(notification.id);
      }
      
      if (notification.targetId && notification.targetType) {
        if (notification.targetType === 'postcomment') {
          navigate(`/posts/${notification.targetId}/`);
        }
        // Si tuvieramos más notificaciones aquí se manejaría con else if
      } else {
        showSnackbar('No se puede navegar a esta notificación', 'info');
      }
      
      setIsNotificationsOpen(false);
    } catch (error) {
      showSnackbar('Error al marcar la notificación como leída', 'error');
    }
  };

  /**
   * Maneja el hover sobre la campana
   * Implementa throttling para evitar peticiones excesivas
   */
  const handleBellHover = () => {
    if (canFetchNotifications()) {
      fetchNotifications(); // Solo obtener notificaciones si ha pasado el tiempo límite
    } else {
      if (isFetching) {
        console.log('Ya hay una petición en curso, esperando respuesta...');
      } else {
        console.log(`Espera ${cooldownTime} segundos antes de la próxima actualización`);
      }
    }
    setIsNotificationsOpen(true);
  };

  /**
   * Maneja el clic en la campana
   * Si no hay notificaciones cargadas, las obtiene
   */
  const handleBellClick = () => {
    if (notifications.length === 0) {
      fetchNotifications();
    }
    setIsNotificationsOpen(prev => !prev);
  };

  /**
   * Refresca las notificaciones manualmente
   * Permite forzar la actualización incluso si no ha pasado el tiempo límite
   */
  const handleRefreshNotifications = async () => {
    if (canFetchNotifications()) {
      await fetchNotifications();
      showSnackbar('Notificaciones actualizadas', 'success');
    } else {
      if (isFetching) {
        showSnackbar('Ya hay una petición en curso, esperando respuesta...', 'info');
      } else {
        showSnackbar(`Espera ${cooldownTime} segundos antes de la próxima actualización`, 'warning');
      }
    }
  };

  /**
   * Formatea el tiempo de la notificación
   */
  const formatNotificationTime = (date) => {
    return notificationService.formatDate(date);
  };

  /**
   * Efecto para obtener el contador cuando se carga el componente
   * o cuando cambia el usuario
   */
  useEffect(() => {
    // No hacer peticiones si el usuario se está deslogueando
    if (isLoggingOut) {
      return;
    }
    
    if (user?.access) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [user?.access, isLoggingOut]);

  /**
   * Efecto para actualizar el cooldown cada segundo
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCooldownTime(getTimeUntilNextFetch());
    }, 1000);

    return () => clearInterval(interval);
  }, [lastFetchTime]);

  // Si no hay usuario autenticado, no mostrar nada
  if (!user) {
    return null;
  }

  return (
    <>
      <li 
        className="notifications-container"
        onMouseEnter={handleBellHover}
        onMouseLeave={() => setIsNotificationsOpen(false)}
      >

        <div 
          className={`notification-icon ${unreadCount > 0 ? 'has-notifications' : ''}`} 
          onClick={handleBellClick}
        >
          {unreadCount > 0 ? (
            <NotificationImportantIcon fontSize="large" color="primary" />
          ) : (
            <NotificationsIcon fontSize="large" />
          )}
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>


        {isNotificationsOpen && (
          <div className="notifications-dropdown show">
             <div className="notifications-header">
               <h3>Notificaciones</h3>
               <div className="notifications-actions">
                 <Tooltip title={
                   isFetching 
                     ? "Petición en curso..." 
                     : canFetchNotifications() 
                       ? "Actualizar" 
                       : `Espera ${cooldownTime} segundos`
                 }>
                   <IconButton 
                     size="small" 
                     onClick={handleRefreshNotifications}
                     disabled={loading || !canFetchNotifications()}
                   >
                     <RefreshIcon fontSize="small" />
                   </IconButton>
                 </Tooltip>
                 {unreadCount > 0 && (
                   <Tooltip title="Marcar todas como leídas">
                     <IconButton 
                       size="small" 
                       onClick={handleMarkAllAsRead}
                     >
                       <CheckIcon fontSize="small" />
                     </IconButton>
                   </Tooltip>
                 )}
               </div>
             </div>
            
            <div className="notifications-content">
              {loading ? (
                <div className="notification-item loading">Cargando notificaciones...</div>
              ) : error ? (
                <div className="notification-item error">Error al cargar notificaciones</div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-message">
                      {notification.message}
                    </div>
                    <div className="notification-time">
                      {formatNotificationTime(notification.createdAt)}
                    </div>
                    {!notification.isRead && <div className="unread-indicator"></div>}
                  </div>
                ))
              ) : (
                <div className="notification-item empty">Sin nuevas notificaciones</div>
              )}
            </div>
          </div>
        )}
      </li>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default NotificationBell;

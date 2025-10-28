/**
 * Interceptor global para axios que maneja errores de autenticación (401)
 */

import axios from 'axios'
import { checkAndHandle401, setSessionExpirationCallback } from './sessionExpirationHandler'

// Re-exportar para mantener la interfaz pública compatible
export const setAxiosForceLogoutCallback = setSessionExpirationCallback

/**
 * Inicializa el interceptor global de axios
 */
export const initializeAxiosInterceptor = () => {
  // Interceptor de respuesta para detectar errores 401
  axios.interceptors.response.use(
    response => response,
    error => {
      checkAndHandle401(error.response?.status)
      return Promise.reject(error)
    }
  )
}

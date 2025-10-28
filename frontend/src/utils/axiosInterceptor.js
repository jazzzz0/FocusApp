/**
 * Interceptor global para axios que maneja errores de autenticación (401)
 */

import axios from 'axios'

let forceLogoutCallback = null
let isProcessingSessionExpired = false

/**
 * Configura el callback que se ejecutará cuando haya un error 401
 * @param {Function} callback - Función que se ejecutará al detectar un 401
 */
export const setAxiosForceLogoutCallback = callback => {
  forceLogoutCallback = callback
}

/**
 * Inicializa el interceptor global de axios
 */
export const initializeAxiosInterceptor = () => {
  // Interceptor de respuesta para detectar errores 401
  axios.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401 && !isProcessingSessionExpired) {
        isProcessingSessionExpired = true
        console.warn('Sesión expirada.')

        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('username')

        if (forceLogoutCallback) {
          forceLogoutCallback()
        }

        setTimeout(() => {
          isProcessingSessionExpired = false
        }, 500)
      }
      return Promise.reject(error)
    }
  )
}

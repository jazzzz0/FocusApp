/**
 * Interceptor para fetch que maneja errores de autenticación (401)
 * y llama a forceLogout cuando el token es inválido
 */

import {
  checkAndHandle401,
  setSessionExpirationCallback,
} from './sessionExpirationHandler'

// Re-exportar para mantener la interfaz pública compatible
export const setForceLogoutCallback = setSessionExpirationCallback

let originalFetch = null

/**
 * Inicializa el interceptor de fetch global
 * Reemplaza la función fetch global con una versión que intercepta 401
 */
export const initializeFetchInterceptor = () => {
  // Guardar el fetch original si aún no lo hemos interceptado
  if (originalFetch === null && typeof window !== 'undefined') {
    originalFetch = window.fetch
  }

  // Reemplazar el fetch global con la versión interceptada
  if (typeof window !== 'undefined' && originalFetch) {
    window.fetch = async (url, options = {}) => {
      const response = await originalFetch(url, options)
      checkAndHandle401(response.status)

      return response
    }
  }
}

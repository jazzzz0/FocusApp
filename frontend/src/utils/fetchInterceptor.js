/**
 * Interceptor para fetch que maneja errores de autenticación (401)
 * y llama a forceLogout cuando el token es inválido
 */

let forceLogoutCallback = null
let originalFetch = null

/**
 * Configura el callback que se ejecutará cuando haya un error 401
 * @param {Function} callback - Función que se ejecutará al detectar un 401
 */
export const setForceLogoutCallback = callback => {
  forceLogoutCallback = callback
}

/**
 * Inicializa el interceptor de fetch global
 * Reemplaza la función fetch global con una versión que intercepta 401
 */
let isProcessingSessionExpired = false

export const initializeFetchInterceptor = () => {
  // Guardar el fetch original si aún no lo hemos interceptado
  if (originalFetch === null && typeof window !== 'undefined') {
    originalFetch = window.fetch
  }

  // Reemplazar el fetch global con la versión interceptada
  if (typeof window !== 'undefined' && originalFetch) {
    window.fetch = async (url, options = {}) => {
      const response = await originalFetch(url, options)

      if (response.status === 401 && !isProcessingSessionExpired) {
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

      return response
    }
  }
}

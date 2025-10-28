/**
 * Utilidad centralizada para manejar la expiración de sesión (401)
 * Evita duplicación de código entre diferentes interceptores
 */

let forceLogoutCallback = null
let isProcessingSessionExpired = false

/**
 * Configura el callback global que se ejecutará cuando haya un error 401
 * @param {Function} callback - Función que se ejecutará al detectar un 401
 */
export const setSessionExpirationCallback = callback => {
  forceLogoutCallback = callback
}

/**
 * Maneja la expiración de sesión cuando se detecta un error 401
 * Limpia el localStorage y ejecuta el callback de logout
 *
 * @param {Object} options - Opciones para el manejo de expiración
 * @param {boolean} options.silent - Si es true, no imprime mensaje de consola
 * @returns {boolean} - True si se procesó la expiración de sesión
 */
export const handleSessionExpiration = ({ silent = false } = {}) => {
  // Evitar procesar múltiples expiraciones simultáneas
  if (isProcessingSessionExpired) {
    return false
  }

  isProcessingSessionExpired = true

  if (!silent) {
    console.warn('Sesión expirada.')
  }

  // Limpiar tokens y datos del usuario
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('username')

  // Ejecutar el callback si está configurado
  if (forceLogoutCallback) {
    forceLogoutCallback()
  }

  // Resetear el flag después de un tiempo para permitir futuras detecciones
  setTimeout(() => {
    isProcessingSessionExpired = false
  }, 500)

  return true
}

/**
 * Función helper para verificar si un error es un 401 y manejarlo
 * @param {number|undefined} status - Status code de la respuesta
 * @param {Object} options - Opciones para handleSessionExpiration
 * @returns {boolean} - True si era un 401 y se manejó
 */
export const checkAndHandle401 = (status, options = {}) => {
  if (status === 401) {
    return handleSessionExpiration(options)
  }
  return false
}

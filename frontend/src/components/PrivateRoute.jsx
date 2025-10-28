import React, { useContext, useState, useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Snackbar, Alert } from '@mui/material'
import { AuthContext } from '../context/AuthContext'

const PrivateRoute = ({ children }) => {
  const { user, loading, isLoggingOut } = useContext(AuthContext)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const [message, setMessage] = useState(
    'Debes iniciar sesión para acceder a esta página'
  )
  const location = useLocation()
  const previousUserRef = useRef(user)
  const hasShownSessionExpired = useRef(false)

  // Este efecto detecta si el usuario tenía sesión y la pierde (por ejemplo, expiró el token),
  // mostrando un mensaje de advertencia sólo una vez y redirigiendo al login.
  // También resetea el flag si el usuario vuelve a autenticarse.
  useEffect(() => {
    if (
      previousUserRef.current &&
      !user &&
      !isLoggingOut &&
      !loading &&
      !hasShownSessionExpired.current
    ) {
      hasShownSessionExpired.current = true
      setMessage('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      setShowSnackbar(true)
      setTimeout(() => {
        setShouldRedirect(true)
      }, 1500)
    }

    if (user && hasShownSessionExpired.current) {
      hasShownSessionExpired.current = false
    }

    previousUserRef.current = user
  }, [user, isLoggingOut, loading])

  // Este efecto controla el acceso a rutas privadas mostrando un Snackbar de advertencia y redirigiendo al login
  // si el usuario no está autenticado, excepto cuando se está realizando logout (lo cual lo maneja el Navbar)
  // o si se encuentra en la página principal.
  useEffect(() => {
    if (!isLoggingOut) {
      if (!loading && !user && location.pathname !== '/') {
        if (!showSnackbar) {
          setShowSnackbar(true)
          setTimeout(() => {
            setShouldRedirect(true)
          }, 2500)
        }
      }
    }
  }, [user, loading, isLoggingOut, location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCloseSnackbar = () => {
    setShowSnackbar(false)
    setShouldRedirect(true)
  }

  if (loading) return <p>Cargando...</p>

  // Si el usuario se está deslogueando, renderizar el contenido pero sin interferir
  if (isLoggingOut) {
    return children // Seguir mostrando el contenido para que el Navbar funcione
  }

  // Si estamos en la página principal, no hacer nada, es pública
  if (!user && location.pathname === '/') {
    return null
  }

  if (!user) {
    return (
      <>
        <Snackbar
          open={showSnackbar}
          autoHideDuration={2500}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="warning"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {message}
          </Alert>
        </Snackbar>
        {shouldRedirect && (
          <Navigate to="/Login" state={{ from: location }} replace />
        )}
      </>
    )
  }
  return children
}

export default PrivateRoute

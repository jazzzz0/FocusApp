import React, { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'

/**
 * PublicRoute impide que un usuario autenticado acceda a rutas públicas como login o registro.
 * Si el usuario ya está autenticado, lo redirige a la página principal ("/").
 * De lo contrario, permite el acceso al contenido hijo.
 */
const PublicRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)

  if (loading) return <p>Cargando...</p>

  if (user) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PublicRoute

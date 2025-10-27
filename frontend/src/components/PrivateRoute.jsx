import React, { useContext, useState, useEffect, useRef } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading, isLoggingOut } = useContext(AuthContext);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [message, setMessage] = useState("Debes iniciar sesión para acceder a esta página");
  const location = useLocation();
  const previousUserRef = useRef(user);
  const hasShownSessionExpired = useRef(false);

  // Detectar si el usuario pasó de autenticado a no autenticado (session expired)
  useEffect(() => {
    // Detectar sesión expirada: usuario tenía sesión pero ahora no la tiene
    if (previousUserRef.current && !user && !isLoggingOut && !loading && !hasShownSessionExpired.current) {
      hasShownSessionExpired.current = true;
      setMessage("Tu sesión ha expirado. Por favor, inicia sesión nuevamente.");
      setShowSnackbar(true);
      // Redirigir después de 1.5 segundos para que se vea el mensaje
      setTimeout(() => {
        setShouldRedirect(true);
      }, 1500);
    }
    
    // También resetear el flag si el usuario cambia nuevamente
    if (user && hasShownSessionExpired.current) {
      hasShownSessionExpired.current = false;
    }
    
    previousUserRef.current = user;
  }, [user, isLoggingOut, loading]);

  useEffect(() => {
    // Solo actuar si NO estamos haciendo logout
    if (!isLoggingOut) {
      // Si no hay usuario y no está cargando, mostrar mensaje
      // Y NO si estamos en la página principal (/)
      if (!loading && !user && location.pathname !== "/") {
        // Solo mostrar el snackbar si no viene de una sesión expirada
        if (!showSnackbar) {
          setShowSnackbar(true);
          // Redirigir después de 2.5 segundos para que se vea el mensaje
          setTimeout(() => {
            setShouldRedirect(true);
          }, 2500);
        }
      }
    }
    // Si isLoggingOut es true, NO hacer NADA, dejar que el Navbar maneje todo
  }, [user, loading, isLoggingOut, location.pathname]);

  const handleCloseSnackbar = () => {
    setShowSnackbar(false);
    // Si el usuario cierra manualmente el snackbar de warning, redirigir inmediatamente
    setShouldRedirect(true);
  };

  if (loading) return <p>Cargando...</p>;
  
  // Si el usuario se está deslogueando, renderizar el contenido pero sin interferir
  if (isLoggingOut) {
    return children; // Seguir mostrando el contenido para que el Navbar funcione
  }
  
  // Si estamos en la página principal, no hacer nada, es pública
  if (!user && location.pathname === "/") {
    return null;
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
        {shouldRedirect && <Navigate to="/Login" state={{ from: location }} replace />}
      </>
    );
  }
  return children;
};

export default PrivateRoute;

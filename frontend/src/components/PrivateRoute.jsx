import React, { useContext, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Snackbar, Alert } from "@mui/material";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading, isLoggingOut } = useContext(AuthContext);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Solo actuar si NO estamos haciendo logout
    if (!isLoggingOut) {
      // Si no hay usuario y no está cargando, mostrar mensaje
      // Y NO si estamos en la página principal (/)
      if (!loading && !user && location.pathname !== "/") {
        setShowSnackbar(true);
        // Redirigir después de 2.5 segundos para que se vea el mensaje
        setTimeout(() => {
          setShouldRedirect(true);
        }, 2500);
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
            Debes iniciar sesión para acceder a esta página
          </Alert>
        </Snackbar>
        {shouldRedirect && <Navigate to="/login" />}
      </>
    );
  }
  return children; // TODO: si hay usuario → renderiza la página protegida 
};

export default PrivateRoute;

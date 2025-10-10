import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <p>Cargando...</p>;
  if (!user) return <Navigate to="/login" />; // si no hay usuario → redirige a login
  return children; // si hay usuario → renderiza la página protegida
};

export default PrivateRoute;

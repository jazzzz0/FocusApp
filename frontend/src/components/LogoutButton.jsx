import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);

  return <button onClick={logout}>Cerrar sesión</button>;
};

export default LogoutButton;

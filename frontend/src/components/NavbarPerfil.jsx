import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css"; // Reutilizamos los mismos estilos

const NavbarPerfil = () => {
  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        FocusApp
      </Link>
      {/* No hay links de menú */}
    </nav>
  );
};

export default NavbarPerfil;

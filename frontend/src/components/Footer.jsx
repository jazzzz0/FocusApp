import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { AuthContext } from "../context/AuthContext";
import '../styles/Footer.css';

const Footer = ({ onLogout }) => {
  const { logout } = useContext(AuthContext);

  const handleLogoutClick = async (e) => {
    e.preventDefault();
    if (onLogout) {
      await onLogout();
    } else {
      await logout();
    }
  };

  return (
    <footer className="main-footer" id="footer">
      <div className="footer-box">
          <h3>Enlaces útiles</h3>
          <div className="footer-links">
            <Link to="/">Inicio</Link>
            <HashLink smooth to="/Homepage#about">Sobre nosotros</HashLink>
            <HashLink smooth to="/Homepage#funciones">Funciones</HashLink>
            <HashLink smooth to="/Homepage#ranking">Ranking</HashLink>
            <Link to="/concursos">Concursos</Link>
            <Link to="/perfil">Perfil</Link>
            <Link to="/subir">Subir Foto</Link>
            <Link to="/Login" onClick={handleLogoutClick}>Cerrar sesión</Link>
          </div>
      </div>
      <div className="footer-credit">
        <span>FocusApp</span> - Todos los derechos reservados &copy; 2025
      </div>
    </footer>
  );
};

export default Footer;

import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Menu as MenuIcon, Close as CloseIcon } from "@mui/icons-material";
import logo from '../assets/imagenes/logo.png';
import '../styles/Navbar.css';
import defaultAvatar from '../assets/imagenes/avatar.png';
import HomeIcon from '@mui/icons-material/Home';
import FloatingMenu from "./FloatingMenu";
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  const handleEdit = () => {
    navigate("/editar-perfil");
    setIsProfileMenuOpen(false); // Cierra el menú después de navegar
    closeMobileMenu();
  };
  const handleLogout = async () => {
    await logout();
    navigate("/Login");
    setIsProfileMenuOpen(false); // Cierra el menú
    closeMobileMenu();
  };

  // Cerrar menú móvil al hacer clic en un enlace
  const closeMobileMenu = () => {
    setIsOpen(false);
  };
  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);


  return (
    <header className="header">
      <div className="container">
        <a href="/" className="logo leckerli-one-regular">
          <img src={logo} alt="FocusApp" className="logo-image" />
          <span className="logo-text">FocusApp</span>
        </a>

        <nav className={`navbar ${isOpen ? "active" : ""}`}>
          <ul className="nav_list">
            {/* 🔹 Si NO hay usuario logueado */}
            {!user ? (
              <>
                <li>
                  <Link to="/Login" onClick={closeMobileMenu}>
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link to="/RegisterForm" onClick={closeMobileMenu}>
                    Registrarse
                  </Link>
                </li>
              </>
            ) : (
              <>
                {/* 🔹 Si el usuario está logueado */}
                <li>
                  <Link to="/" onClick={closeMobileMenu}>
                    <HomeIcon fontSize="medium" />
                  </Link>
                </li>
                {/* 🆕 CONTENEDOR DEL AVATAR Y EL MENÚ DESPLEGABLE */}
                <li
                  className="profile-menu-container"
                  // Muestra el menú al entrar y lo oculta al salir con el cursor
                  onMouseEnter={() => setIsProfileMenuOpen(true)}
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  {/* 1. Imagen de Perfil (Avatar) */}
                  <Link to="/perfil" onClick={closeMobileMenu}>
                    <img
                      src={user.profile_pic || defaultAvatar}
                      alt="Perfil"
                      className="nav-avatar"
                    />
                  </Link>

                  {/* 2. Menú Desplegable (se muestra condicionalmente) */}
                  {isProfileMenuOpen && (
                    <div className="profile-dropdown">
                      <button className="dropdown-btn" onClick={handleEdit}>
                        ✍️ Editar perfil
                      </button>
                      <button className="dropdown-btn logout-btn" onClick={handleLogout}>
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </li>
              </>
            )}
          </ul>
        </nav>

        <div
          className={`menu-icon ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </div>
        {user && <FloatingMenu />}
      </div>
    </header >
  );
};

export default Navbar;

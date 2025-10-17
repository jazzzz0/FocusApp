import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { AuthContext } from "../context/AuthContext";
import { CategoriesContext } from "../context/CategoriesContext";
import logo from '../assets/imagenes/logo.png';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const { categories } = useContext(CategoriesContext);

  const handleLogout = async () => {
    await logout();
    navigate("/Login");
  };

  // Cerrar menú móvil al hacer clic en un enlace
  const closeMobileMenu = () => {
    setIsOpen(false);
    setShowDropdown(false);
  };

  // Cerrar menú móvil al cambiar de ruta
  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  // Función para determinar si un enlace está activo (solo para rutas normales, no hash)
  const isActive = (path) => {
    // Solo aplicar a rutas que no sean del Homepage con hash
    if (path.includes('#') || path === '/Homepage') {
      return false;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="header">
      <div className="container">
        <a href="/Homepage" className="logo leckerli-one-regular">
            <img src={logo} alt="FocusApp" className="logo-image" />
            <span className="logo-text">FocusApp</span>
          </a>

        <nav className={`navbar ${isOpen ? "active" : ""}`}>
          <ul className="nav_list">
            <li>
              <HashLink 
                smooth 
                to="/Homepage" 
                onClick={closeMobileMenu}
              >
                Inicio
              </HashLink>
            </li>
            {/* <li>
              <HashLink 
                smooth 
                to="/Homepage#ranking" 
                className={isActive('/Homepage') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Ranking
              </HashLink>
            </li> */}
            <li
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className={showDropdown ? 'active' : ''}>Explorar</span>
              {showDropdown && (
                <ul className="dropdown-menu">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <Link 
                        to={`/explorar/${cat.slug}`}
                        className={isActive(`/explorar/${cat.slug}`) ? 'active' : ''}
                        onClick={closeMobileMenu}
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li>
              <Link 
                to="/perfil" 
                className={isActive('/perfil') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Perfil
              </Link>
            </li>
            <li>
              <Link 
                to="/subir" 
                className={isActive('/subir') ? 'active' : ''}
                onClick={closeMobileMenu}
              >
                Subir Foto
              </Link>
            </li>
            <li>
              <button onClick={handleLogout}>Cerrar sesión</button>
            </li>
          </ul>
        </nav>

        <div
          className={`menu-icon ${isOpen ? "open" : ""}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          <i className={isOpen ? "fas fa-times" : "fas fa-bars"}></i>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

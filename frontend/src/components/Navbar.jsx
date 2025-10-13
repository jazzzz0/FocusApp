import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { logout } = useContext(AuthContext);
  const { categories } = useContext(CategoriesContext);

  const handleLogout = async () => {
    await logout();
    navigate("/Login");
  };

  return (
    <header className="header">
      <div className="container">
        <a href="#" className="logo leckerli-one-regular">
            <img src={logo} alt="FocusApp" className="logo-image" />
            <span className="logo-text">FocusApp</span>
          </a>

        <nav className={`navbar ${isOpen ? "active" : ""}`}>
          <ul className="nav_list">
            <li><HashLink smooth to="/Homepage#about">Nosotros</HashLink></li>
            <li><HashLink smooth to="/Homepage#funciones">Funciones</HashLink></li>
            <li><HashLink smooth to="/Homepage#ranking">Ranking</HashLink></li>
            <li
              onMouseEnter={() => setShowDropdown(true)}
              onMouseLeave={() => setShowDropdown(false)}
            >
              Explorar
              {showDropdown && (
                <ul className="dropdown-menu">
                  {categories.map(cat => (
                    <li key={cat.id}>
                      <Link to={`/explorar/${cat.slug}`}>{cat.name}</Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
            <li><Link to="/perfil">Perfil</Link></li>
            <li><Link to="/subir">Subir Foto</Link></li>
            <li><button onClick={handleLogout}>Cerrar sesión</button></li>
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
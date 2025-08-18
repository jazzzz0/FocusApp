import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/Bienvenida.css';
import logo from '../assets/imagenes/logo.png';
import fotoBienvenida from '../assets/imagenes/naturaleza.webp';

function Bienvenida() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="container">
          <a href="#" className="logo leckerli-one-regular">
            <img src={logo} alt="FocusApp" className="logo-image" />
            <span className="logo-text">FocusApp</span>
          </a>

          <div className="menu-icon" id="menu-btn" onClick={toggleMenu}>
            <i className="fas fa-bars"></i>
          </div>
        </div>
        {menuOpen && (
          <nav className="menu desplegado">
            <ul>
              <li><Link to="/inicio">Inicio</Link></li>
              <li><Link to="/galeria">Galería</Link></li>
              <li><Link to="/perfil">Perfil</Link></li>
            </ul>
          </nav>
        )}
      </header>

      {/* Pantalla de bienvenida */}
      <section 
        className="welcome-screen" 
        style={{ backgroundImage: `url(${fotoBienvenida})` }}
      >
        <div className="overlay">
          <h1>Bienvenido a FocusApp</h1>
          <p>La comunidad fotográfica donde compartimos nuestra pasión por la fotografía.</p>
          <Link to="/RegisterForm" className="btn entrar-btn">
            Entrar a la comunidad
          </Link>
        </div>
      </section>
    </>
  );
}

export default Bienvenida;

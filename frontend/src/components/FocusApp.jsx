import React from 'react';
import portada from '../assets/imagenes/portada.jpg';
import logo from '../assets/imagenes/guido.png';
import retrato from '../assets/imagenes/retrato.jpg';
import naturaleza from '../assets/imagenes/naturaleza.jpg';
import urbano from '../assets/imagenes/urbano.webp';
import arte from '../assets/imagenes/arte-conceptual.jpg';
import grupo from '../assets/imagenes/grupo.jpg';
import perfil from '../assets/imagenes/perfil-del-usuario.png';
import subir from '../assets/imagenes/subir.png';
import puntuacion from '../assets/imagenes/puntuacion.png';
import categoria from '../assets/imagenes/categoria.png';
import ranking from '../assets/imagenes/ranking.jpg';
import comunidad from '../assets/imagenes/comunidad.png';
import feedback from '../assets/imagenes/feedback.png';
import '../styles/focusApp.css'; 

function FocusApp() {
  const scrollCarousel = (direction) => {
    const carousel = document.getElementById('carousel');
    const scrollAmount = 300;
    carousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <a href="#" className="logo leckerli-one-regular">
            <img src={logo} alt="FocusApp" className="logo-image" />
            <span className="logo-text">FocusApp</span>
          </a><br />
          <nav className="navbar" id="navbar">
            <ul className="nav_list">
              <li><a href="#about">Nosotros</a></li>
              <li><a href="#funciones">Funciones</a></li>
              <li><a href="/subir">Subir Foto</a></li>
              <li><a href="#ranking">Ranking</a></li>
              <li><a href="/concursos">Concursos</a></li>
              <li><a href="/inicio">Cerrar sesión</a></li>
            </ul>
          </nav>
          <div className="menu-icon" id="menu-btn">
            <i className="fas fa-bars"></i>
          </div>
        </div>
      </header>

      <section className="home cover" id="home">
        <img src={portada} className="wave" alt="FocusApp portada" />
      </section>

      <section className="categories" id="categorias">
        <h1 className="heading">Categorías <span>Populares</span></h1>
        <div className="carousel-wrapper">
          <button className="carousel-btn left" onClick={() => scrollCarousel(-1)}>‹</button>
          <div className="box-container" id="carousel">
            {[{src: retrato, label: "Retratos"}, {src: naturaleza, label: "Naturaleza"}, {src: urbano, label: "Urbano"}, {src: arte, label: "Arte Conceptual"}].map((cat, i) => (
              <div className="box" key={i}>
                <img src={cat.src} alt={cat.label} />
                <h3>{cat.label}</h3>
              </div>
            ))}
          </div>
          <button className="carousel-btn right" onClick={() => scrollCarousel(1)}>›</button>
        </div>
      </section>

      <section className="about" id="about">
        <h1 className="heading"><span>Sobre</span> Nosotros</h1>
        <div className="row">
          <div className="image">
            <img src={grupo} alt="Sobre FocusApp" />
          </div>
          <div className="content">
            <h3>¿Qué es FocusApp?</h3>
            <p>
              FocusApp es una comunidad digital para fotógrafos, donde podrás compartir tus obras,
              recibir puntuaciones, participar en concursos y aprender junto a otros apasionados por la fotografía.
            </p>
            <a href="#funciones" className="btn">Explorar funciones</a>
          </div>
        </div>
      </section>

      <section className="faq" id="funciones">
        <h1 className="heading">Funciones <span>Clave</span></h1>
        <div className="box-container">
          {[
            { img: perfil, title: "Perfil de usuario", desc: "Crea tu perfil personalizado..." },
            { img: subir, title: "Subida de fotos", desc: "Publicá tus fotografías..." },
            { img: puntuacion, title: "Puntuación comunitaria", desc: "Las fotos habilitadas..." },
            { img: categoria, title: "Categorización", desc: "Organizá tus fotos..." },
            { img: ranking, title: "Ranking de publicaciones", desc: "Descubrí las fotos más valoradas..." },
            { img: comunidad, title: "Concursos comunitarios", desc: "Participá en desafíos temáticos..." },
            { img: feedback, title: "Comentarios y feedback", desc: "Comentá en publicaciones..." }
          ].map((func, i) => (
            <div className="box" key={i}>
              <div className="image">
                <img src={func.img} alt={func.title} />
              </div>
              <div className="content">
                <h3>{func.title}</h3>
                <p>{func.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export default FocusApp;

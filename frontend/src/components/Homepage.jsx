// pages/Homepage.jsx
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "./Footer";
import CategoryCarousel from "../components/CategoryCarousel";

// Imágenes locales para secciones

import grupo from '../assets/imagenes/grupo.jpg';
import perfil from '../assets/imagenes/avatar.png';
import subir from '../assets/imagenes/subir.png';
import puntuacion from '../assets/imagenes/puntuacion.png';
import categoria from '../assets/imagenes/categoria.png';
import ranking from '../assets/imagenes/ranking.jpg';
import comunidad from '../assets/imagenes/comunidad.png';
import feedback from '../assets/imagenes/feedback.png';

import '../styles/main.css';
import '../styles/Home.css';
import '../styles/Bienvenida.css';

function Homepage() {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Navbar */}
      <Navbar onLogout={handleLogout} />

       {/* Portada */}
      {/*<section className="home cover" id="home">
        <img src={portada} className="wave" alt="FocusApp portada" />
      </section> */}

      {/* Carousel de categorías */}
      <CategoryCarousel />

      {/* Sobre nosotros */}
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

      {/* Funciones */}
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

      {/* Footer */}
      <Footer onLogout={handleLogout} />
    </>
  );
}

export default Homepage;

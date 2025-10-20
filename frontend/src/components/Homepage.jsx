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
  const { logout, user } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
  };

  const scrollToCategories = () => {
    const categoriesSection = document.getElementById('categories-section');
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToFunctions = () => {
    const functionsSection = document.getElementById('funciones');
    if (functionsSection) {
      functionsSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };
  return (
    <>
      {/* Navbar */}
      <Navbar onLogout={handleLogout} />

       {/* Sección de Bienvenida */}
      <section className="welcome-section" id="welcome">
        <div className="welcome-container">
          <div className="welcome-content">
            <div className="welcome-text">
              {user ? (
                // Usuario autenticado - Saludo personalizado
                <>
                  <h1 className="welcome-title">
                    ¡Que bueno verte de nuevo, <span className="brand-name">{user.username}</span>!
                  </h1>
                  <p className="welcome-subtitle">
                    Bienvenido de vuelta a tu comunidad fotográfica
                  </p>
                  <p className="welcome-description">
                    Sigue compartiendo tu creatividad y conectando con otros fotógrafos apasionados. 
                    Explora nuevas ideas, inspira y déjate inspirar. Tu próxima gran captura te está esperando.
                  </p>
                </>
              ) : (
                // Usuario no autenticado - Mensaje de bienvenida general
                <>
                  <h1 className="welcome-title">
                    Bienvenido a <span className="brand-name">FocusApp</span>
                  </h1>
                  <p className="welcome-subtitle">
                    La comunidad donde la fotografía cobra vida
                  </p>
                  <p className="welcome-description">
                    Descubre, comparte y conecta con fotógrafos de todo el mundo. 
                    Sube tus mejores capturas, participa en concursos y forma parte 
                    de una comunidad apasionada por el arte visual.
                  </p>
                  <div className="welcome-actions">
                    <Link to="/RegisterForm" className="btn-primary">
                      Unirse
                    </Link>
                    <button onClick={scrollToCategories} className="btn-secondary"> 
                      Ver más
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="welcome-visual">
              {/* <div className="photo-grid">
                <div className="photo-item photo-1">
                  <div className="photo-placeholder"></div>
                </div>
                <div className="photo-item photo-2">
                  <div className="photo-placeholder"></div>
                </div>
                <div className="photo-item photo-3">
                  <div className="photo-placeholder"></div>
                </div>
                <div className="photo-item photo-4">
                  <div className="photo-placeholder"></div>
                </div>
              </div> */}
              
              {/* Elementos Visuales Creativos */}
              <div className="creative-visual">
                <div className="floating-elements">
                  <div className="floating-icon icon-camera">📷</div>
                  <div className="floating-icon icon-heart">❤️</div>
                  <div className="floating-icon icon-star">⭐</div>
                  <div className="floating-icon icon-trophy">🏆</div>
                  <div className="floating-icon icon-globe">🌍</div>
                  <div className="floating-icon icon-lightning">⚡</div>
                </div>
                
                <div className="center-focus">
                  <div className="focus-ring ring-1"></div>
                  <div className="focus-ring ring-2"></div>
                  <div className="focus-ring ring-3"></div>
                  <div className="focus-center">
                    <div className="focus-icon">🎯</div>
                  </div>
                </div>
                
                <div className="particle-system">
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                  <div className="particle"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Carousel de categorías */}
      <div id="categories-section">
        <CategoryCarousel />
      </div>

      {/* Sobre nosotros */}
      <section className="about" id="about">
        <h1 className="heading"><span>Sobre</span> Nosotros</h1>
        <div className="row">
          <div className="image">
            <img src={grupo} alt="Sobre FocusApp" />
          </div>
          <div className="about-description">
            <h3>¿Qué es FocusApp?</h3>
            <p>
              FocusApp es una comunidad digital para fotógrafos, donde podrás compartir tus obras,
              recibir puntuaciones, participar en concursos y aprender junto a otros apasionados por la fotografía.
            </p>
            <a onClick={scrollToFunctions} className="btn">Explorar funciones</a>
          </div>
        </div>
      </section>

      {/* Funciones */}
      <section className="faq" id="funciones">
        <h1 className="heading">Funciones <span>Clave</span></h1>
        <div className="box-container">
          {[
            { img: perfil, title: "Perfil", desc: "Mostrá tu portfolio fotográfico para que la comunidad pueda conocerte." },
            { img: subir, title: "Publicación de Fotos", desc: "Subí tus mejores capturas y compartí tu creatividad con el mundo." },
            { img: puntuacion, title: "Valoraciones de la Comunidad", desc: "Recibí puntuaciones y comentarios genuinos de otros usuarios para mejorar tu trabajo." },
            { img: categoria, title: "Explorá por Categorías", desc: "Descubrí fotografías clasificadas por temáticas para inspirarte o participar." },
            { 
              img: ranking, 
              title: "Ranking Fotográfico", 
              desc: "Las fotos con mejor promedio suben a la cima de la categoría: ¡si tu puntuación es alta, tu trabajo se destaca primero!" 
            },
            { img: feedback, title: "Feedback Colaborativo", desc: "Opiná y aprendé de los demás dejando comentarios constructivos en cada foto." }
            // { img: comunidad, title: "Concursos y Retos", desc: "Sumate a concursos temáticos, superá desafíos y ganá reconocimiento en la comunidad." },
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

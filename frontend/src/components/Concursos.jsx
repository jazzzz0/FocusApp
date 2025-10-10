//import CarruselConcursos from '../components/CarruselConcursos';

/*const Concursos = () => {
  return (
    <main>
      <CarruselConcursos />
    </main>
  );
};

export default Concursos;
*/
// src/components/Concursos.jsx
import React, { useEffect } from "react";
import Swiper, { Navigation, Pagination, Autoplay } from "swiper";
import "swiper/swiper-bundle.min.css";
import "../styles/Focusapp.css"; // tu CSS base
import "../styles/concursos.css"; // estilos específicos para concursos
import "../styles/concursos_puntuar.css"

Swiper.use([Navigation, Pagination, Autoplay]);

const concursosData = [
  {
    img: "/imagenes/concurso1.webp",
    alt: "Concurso Naturaleza",
    title: 'Concurso "Belleza Natural"',
    date: "Hasta el 20 de julio",
    description:
      "Subí tus mejores fotos de paisajes, animales o naturaleza. ¡Participá por premios y reconocimientos!",
    btnText: "Ver bases",
    btnLink: "#",
  },
  {
    img: "/imagenes/concurso2.webp",
    alt: "Concurso Urbano",
    title: "Desafío Fotografía Urbana",
    date: "Finaliza el 30 de julio",
    description:
      "Mostrá la esencia de la ciudad en tus fotos. Las más votadas serán destacadas en nuestro ranking mensual.",
    btnText: "Participar",
    btnLink: "#",
  },
  {
    img: "/imagenes/retratos.png",
    alt: "Concurso Retratos",
    title: "Retratos con Estilo",
    date: "Inscripciones abiertas hasta el 15 de agosto",
    description:
      "Capturá la esencia de las personas. Las mejores fotos serán exhibidas en nuestra galería virtual.",
    btnText: "Más info",
    btnLink: "#",
  },
  {
    img: "/imagenes/concurso4.jpg",
    alt: "Concurso Arte Conceptual",
    title: "Arte en todas sus formas",
    date: "Inscripciones abiertas hasta el 20 de diciembre",
    description:
      "Capturá la esencia del Arte. Las mejores fotos serán exhibidas en nuestra galería virtual.",
    btnText: "Más info",
    btnLink: "#",
  },
  {
    img: "/imagenes/concurso5.jpg",
    alt: "Concurso Deportivo",
    title: "Deportes en Acción",
    date: "Inscripciones abiertas hasta el 20 de diciembre",
    description:
      "Acción Deportiva. Las mejores fotos serán exhibidas en nuestra galería virtual.",
    btnText: "Más info",
    btnLink: "#",
  },
];

const Concursos = () => {
  useEffect(() => {
    new Swiper(".swiper-container", {
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      slidesPerView: 2,
      spaceBetween: 30,
    });
  }, []);

  return (
    <div style={{ width: "100%", backgroundColor: "var(--bg-color, #242424)", color: "var(--text-color, #fff)" }}>
      {/* Header */}
      <header className="header">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" className="logo leckerli-one-regular" style={{ display: "flex", alignItems: "center" }}>
            <img src="/imagenes/logo.png" alt="FocusApp" className="logo-image" style={{ height: "50px", marginRight: "10px" }} />
            <span className="logo-text">FocusApp</span>
          </a>
          <nav className="navbar">
            <ul className="nav_list" style={{ display: "flex", gap: "20px" }}>
              <li>
                <a href="/puntuar_foto">Puntuar Fotos</a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Concursos */}
      <section className="noticias" id="concursos" style={{ padding: "2rem" }}>
        <h1 className="heading">
          Concursos <span>Destacados</span>
        </h1>

        <div className="swiper-container">
          <div className="swiper-wrapper">
            {concursosData.map((concurso, index) => (
              <div className="swiper-slide box" key={index} style={{ backgroundColor: "#1a1a1a", borderRadius: "12px", padding: "1rem" }}>
                <div className="imagen">
                  <img src={concurso.img} alt={concurso.alt} style={{ width: "100%", borderRadius: "12px" }} />
                </div>
                <div className="content" style={{ marginTop: "1rem" }}>
                  <a href={concurso.btnLink} className="title" style={{ fontSize: "1.2rem", color: "#646cff", fontWeight: "600" }}>
                    {concurso.title}
                  </a>
                  <span style={{ display: "block", margin: "0.5rem 0", fontSize: "0.9rem", color: "#aaa" }}>{concurso.date}</span>
                  <p style={{ marginBottom: "1rem", color: "#ccc" }}>{concurso.description}</p>
                  <a href={concurso.btnLink} className="btn" style={{ backgroundColor: "#646cff", color: "#fff", padding: "0.5rem 1rem" }}>
                    {concurso.btnText}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="swiper-pagination"></div>
          <div className="swiper-button-next" style={{ color: "#646cff" }}></div>
          <div className="swiper-button-prev" style={{ color: "#646cff" }}></div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ padding: "1rem 0", textAlign: "center" }}>
        <p style={{ color: "#fff" }}>&copy; 2024 FocusApp. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Concursos;

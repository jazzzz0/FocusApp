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
import React from "react";
import logo from '../assets/imagenes/logo.png';
import concurso1 from '../assets/imagenes/concurso1.webp';
import concurso2 from '../assets/imagenes/concurso2.webp';
import concurso3 from '../assets/imagenes/retratos.png';
import concurso4 from '../assets/imagenes/cooncurso4.jpg';
import concurso5 from '../assets/imagenes/concurso5.jpg';
// Importa Swiper React components y módulos necesarios
import { Swiper, SwiperSlide } from "swiper/react"; // Usa Swiper y SwiperSlide desde swiper/react
import { Navigation, Pagination, Autoplay } from "swiper/modules"; // Módulos desde swiper/modules
import "swiper/css";
import "../styles/Focusapp.css"; // tu CSS base
import "../styles/concursos.css"; // estilos específicos para concursos
import "../styles/concursos_puntuar.css"
import "swiper/css/navigation";
import "swiper/css/pagination";


const concursosData = [
  {
    img: concurso1,
    alt: "Concurso Naturaleza",
    title: 'Concurso "Belleza Natural"',
    date: "Hasta el 20 de julio",
    description:
      "Subí tus mejores fotos de paisajes, animales o naturaleza. ¡Participá por premios y reconocimientos!",
    btnText: "Ver bases",
    btnLink: "#",
  },
  {
    img: concurso2,
    alt: "Concurso Urbano",
    title: "Desafío Fotografía Urbana",
    date: "Finaliza el 30 de julio",
    description:
      "Mostrá la esencia de la ciudad en tus fotos. Las más votadas serán destacadas en nuestro ranking mensual.",
    btnText: "Participar",
    btnLink: "#",
  },
  {
    img: concurso3,
    alt: "Concurso Retratos",
    title: "Retratos con Estilo",
    date: "Inscripciones abiertas hasta el 15 de agosto",
    description:
      "Capturá la esencia de las personas. Las mejores fotos serán exhibidas en nuestra galería virtual.",
    btnText: "Más info",
    btnLink: "#",
  },
  {
    img: concurso4,
    alt: "Concurso Arte Conceptual",
    title: "Arte en todas sus formas",
    date: "Inscripciones abiertas hasta el 20 de diciembre",
    description:
      "Capturá la esencia del Arte. Las mejores fotos serán exhibidas en nuestra galería virtual.",
    btnText: "Más info",
    btnLink: "#",
  },
  {
    img:  concurso5,
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

  return (
    <div >
      {/* Header */}
      <header className="header">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" className="logo leckerli-one-regular" style={{ display: "flex", alignItems: "center" }}>
            <img src={logo} alt="FocusApp" className="logo-image" style={{ height: "50px", marginRight: "10px" }} />
            <span className="logo-text">FocusApp</span>
          </a>
          <nav className="navbar">
            <ul className="nav_list" style={{ display: "flex", gap: "20px" }}>
              <li>
                <a href="/PuntuarFoto">Puntuar Fotos</a>
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
        <Swiper
          modules={[Navigation, Pagination, Autoplay]} // Pasamos los módulos como una prop
          className="swiper-container"
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          slidesPerView={2}
          spaceBetween={30}
        >
          {concursosData.map((concurso, index) => (
            // El componente <SwiperSlide> reemplaza a <div className="swiper-slide">
            <SwiperSlide
              className="box"
              key={index}
              style={{ backgroundColor: "#29262636", borderRadius: "12px", padding: "1rem" }}
            >
              <div className="imagen">
                <img src={concurso.img} alt={concurso.alt} style={{ width: "100%", height: "300px", borderRadius: "12px" }} />
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
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Footer */}
      <footer className="footer" style={{ padding: "1rem 0", textAlign: "center" }}>
        <p style={{ color: "#fff" }}>&copy; 2024 FocusApp. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};

export default Concursos;

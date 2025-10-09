/// src/components/PuntuarFoto.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/focusapp.css";
//import "../styles/concursos.css";
import "../styles/concursos_puntuar.css";

const fotosData = [
  { img: "/imagenes/animales.jpg", title: "Naturaleza y Paisajes", author: "Foto de Claudio Perez", btnText: "Valorar" },
  { img: "/imagenes/retratos.png", title: "Retrato y Moda", author: "Marcela Facci", btnText: "Valorar" },
  { img: "/imagenes/urbano.webp", title: "Arquitectura y Urbanismo", author: "Leonardo Flarion", btnText: "Valorar" },
  { img: "/imagenes/13.jpeg", title: "Fotografía Documental y Callejera", author: "Julieta Cerrat", btnText: "Valorar" },
  { img: "/imagenes/foto 6.jpg", title: "Comida y Estilismo Culinario", author: "Lara Mayan", btnText: "Valorar" },
  { img: "/imagenes/foto 4.jpg", title: "Concursos Futuros", author: "Participá en desafíos temáticos con votación abierta a todos los usuarios registrados.", btnText: "Ir" },
  { img: "/imagenes/foto 2.jpg", title: "Comentarios y feedback", author: "Comentá en publicaciones, dejá feedback constructivo y conectá con otros fotógrafos.", btnText: "Ir" },
  { img: "/imagenes/foto2.png", title: "¿Te gustaria participar con tu foto?", author: "Mira las reglas e inscripciones en cada categoria", btnText: "Ir" },
];

const PuntuarFoto = () => {
  return (
    <div style={{ backgroundColor: "#242424", color: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <header className="header">
        <div className="container" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/" className="logo leckerli-one-regular" style={{ display: "flex", alignItems: "center" }}>
            <img src="/imagenes/logo.png" alt="FocusApp" className="logo-image" style={{ height: "50px", marginRight: "10px" }} />
            <span className="logo-text">FocusApp</span>
          </a>
          <nav className="navbar">
            <ul className="nav_list" style={{ display: "flex", gap: "20px" }}>
              <li><a href="/loginok">Volver al Perfil</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Sección de Fotos */}
      <section className="faq" id="funciones" style={{ padding: "2rem" }}>
        <h1 className="heading">Fotos por Categorias</h1>
        <div className="box-container" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
          {fotosData.map((foto, index) => (
            <div key={index} className="box" style={{ backgroundColor: "#1a1a1a", borderRadius: "12px", padding: "1rem", width: "250px", textAlign: "center" }}>
              <div className="image">
                <img src={foto.img} alt={foto.title} style={{ width: "100%", borderRadius: "12px" }} />
              </div>
              <div className="content" style={{ marginTop: "1rem" }}>
                <h3>{foto.title}</h3>
                <p style={{ color: "#ccc", fontSize: "0.9rem" }}>{foto.author}</p>
              </div>

              {/* BOTÓN: si es "Valorar" lleva a /valorar */}
              {foto.btnText === "Valorar" ? (
                <Link to="/valorar">
                  <button className="btn" style={{ backgroundColor: "#646cff", color: "#fff", marginTop: "0.5rem" }}>
                    {foto.btnText}
                  </button>
                </Link>
              ) : (
                <button className="btn" style={{ backgroundColor: "#646cff", color: "#fff", marginTop: "0.5rem" }}>
                  {foto.btnText}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default PuntuarFoto;

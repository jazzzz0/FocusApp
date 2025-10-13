// src/components/ValorarFoto.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/concursos_puntuar.css";

const fotosParaValorar = [
  {
    src: "/imagenes/naturaleza1.jpg",
    titulo: "Volvan Activo",
  },
  {
    src: "/imagenes/animales.jpg",
    titulo: "Todos Comen",
  },
  {
    src: "/imagenes/naturaleza.jpg",
    titulo: "Belleza Natural",
  },
];

const ValorarFoto = () => {
  return (
    <div style={{ backgroundColor: "#242424", minHeight: "100vh", color: "#fff" }}>
      {/* Header */}
      <header className="header">
        <div className="container">
          <a href="/puntuar_foto" className="logo leckerli-one-regular" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/imagenes/logo.png" alt="FocusApp" style={{ height: "50px" }} />
            <span className="logo-text">FocusApp</span>
          </a>
        </div>
      </header>

      {/* Sección de valoración */}
      <section className="about" style={{ padding: "2rem", textAlign: "center" }}>
        <h1 className="heading">Naturaleza y Paisajes</h1>
        <h2 className="heading">Vista de fotos</h2>

        {fotosParaValorar.map((foto, index) => (
          <div key={index} className="container" style={{ margin: "2rem 0" }}>
            <img src={foto.src} alt={`Foto ${foto.titulo}`} width="300" style={{ borderRadius: "12px" }} />
            <h2 style={{ marginTop: "1rem" }}>Título: {foto.titulo}</h2>

            <h3>Puntuar esta foto:</h3>
            <form className="estrellas">
              <input type="radio" id={`estrella5-${index}`} name={`valoracion-${index}`} value="5" />
              <label htmlFor={`estrella5-${index}`}>★</label>

              <input type="radio" id={`estrella4-${index}`} name={`valoracion-${index}`} value="4" />
              <label htmlFor={`estrella4-${index}`}>★</label>

              <input type="radio" id={`estrella3-${index}`} name={`valoracion-${index}`} value="3" />
              <label htmlFor={`estrella3-${index}`}>★</label>

              <input type="radio" id={`estrella2-${index}`} name={`valoracion-${index}`} value="2" />
              <label htmlFor={`estrella2-${index}`}>★</label>

              <input type="radio" id={`estrella1-${index}`} name={`valoracion-${index}`} value="1" />
              <label htmlFor={`estrella1-${index}`}>★</label>
            </form>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ValorarFoto;

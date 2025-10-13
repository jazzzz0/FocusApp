import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/concursos_puntuar.css";
import logo from "../assets/imagenes/logo.png";
import naturaleza1 from "../assets/imagenes/naturaleza1.jpg";
import animales from "../assets/imagenes/animales.jpg";
import naturaleza from "../assets/imagenes/naturaleza.jpg";

const fotosParaValorar = [
  { src: naturaleza, titulo: "Belleza Natural" },
  { src: naturaleza1, titulo: "Volcán Activo" },
  { src: animales, titulo: "Todos Comen" },
  
];

const ValorarFoto = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const categoria = params.get("categoria") || "Naturaleza y Paisajes";

  const [valoraciones, setValoraciones] = useState({});

  const manejarValoracion = (fotoIndex, valor) => {
    setValoraciones({ ...valoraciones, [fotoIndex]: valor });
  };

  const irAlPerfil = () => {
    navigate("/Homepage");
  };

  return (
    <div style={{ backgroundColor: "#242424", minHeight: "100vh", color: "#fff" }}>
      {/* Header */}
      <header className="header">
        <div className="container">
          <Link
            to="/PuntuarFoto"
            className="logo leckerli-one-regular"
            style={{ display: "flex", alignItems: "center", gap: "10px" }}
          >
            <img src={logo} alt="FocusApp" style={{ height: "50px" }} />
            <span className="logo-text">FocusApp</span>
          </Link>
        </div>
      </header>

      {/* Sección de valoración */}
      <section className="about" style={{ padding: "2rem", textAlign: "center" }}>
        <h1 className="heading">{categoria}</h1>
        <h2 className="heading">Vista de fotos</h2>

        {fotosParaValorar.map((foto, index) => (
          <div key={index} className="container" style={{ margin: "2rem 0" }}>
            <img
              src={foto.src}
              alt={`Foto ${foto.titulo}`}
              width="300"
              style={{ borderRadius: "12px", marginBottom: "1rem" }}
            />

            {/* Título de la foto */}
            <h2
              style={{
                fontSize: "1.4rem",
                color: "#040114ff",
                marginBottom: "0.8rem",
                fontWeight: "600",
              }}
            >
              {foto.titulo}
            </h2>

            <h3 style={{ marginBottom: "0.5rem" }}>Puntuar esta foto:</h3>
            <div style={{ fontSize: "2rem", cursor: "pointer" }}>
              {[1, 2, 3, 4, 5].map((estrella) => (
                <span
                  key={estrella}
                  onClick={() => manejarValoracion(index, estrella)}
                  style={{
                    color:
                      estrella <= (valoraciones[index] || 0)
                        ? "#FFD700"
                        : "#555",
                    transition: "color 0.2s",
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        ))}

        {/* Botón "Listo" */}
        <button
          onClick={irAlPerfil}
          style={{
            marginTop: "2rem",
            padding: "0.8rem 2rem",
            backgroundColor: "#0a3563",
            color: "#ffffffff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "1rem",
            transition: "all 0.3s ease",
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = " #0a3563")}
          onMouseOut={(e) => (e.target.style.backgroundColor = "#0a3563")}
        >
          Listo
        </button>
      </section>
    </div>
  );
};

export default ValorarFoto;

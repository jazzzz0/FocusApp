import React, { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import portada from '../assets/imagenes/portada.jpg';
import logo from '../assets/imagenes/logo.png';
import retrato from '../assets/imagenes/retrato.jpg';
import naturaleza from '../assets/imagenes/naturaleza.jpg';
import urbano from '../assets/imagenes/urbano.webp';
import arte from '../assets/imagenes/arte-conceptual.jpg';
import deportivo from '../assets/imagenes/deporte.webp';
import documental from '../assets/imagenes/documental.jpg';
import comida from '../assets/imagenes/comida.jpg';
import grupo from '../assets/imagenes/grupo.jpg';
import perfil from '../assets/imagenes/avatar.png';
import subir from '../assets/imagenes/subir.png';
import puntuacion from '../assets/imagenes/puntuacion.png';
import categoria from '../assets/imagenes/categoria.png';
import ranking from '../assets/imagenes/ranking.jpg';
import comunidad from '../assets/imagenes/comunidad.png';
import feedback from '../assets/imagenes/feedback.png';

import '../styles/focusApp.css';
import '../styles/Home.css';
import '../styles/Bienvenida.css';


const categories = [
    { src: retrato, label: "Retratos y Moda" },
    { src: naturaleza, label: "Naturaleza y Paisajes" },
    { src: urbano, label: "Arquitectura y Urbanismo" },
    { src: arte, label: "Arte Conceptual y Fotomanipulación" },
    { src: deportivo, label: "Deportes y Acción" },
    { src: documental, label: "Fotografía Documental y Callejera" },
    { src: comida, label: "Comida y Estilismo Culinario" }


];

function Homepage() {
    const [current, setCurrent] = useState(0);
    const timeoutRef = useRef(null);
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    // Avanza automáticamente cada 8 segundos
    useEffect(() => {
        timeoutRef.current = setTimeout(() => {
            setCurrent((prev) => (prev + 1) % categories.length);
        }, 8000);
        return () => clearTimeout(timeoutRef.current);
    }, [current]);

    const goToSlide = (idx) => {
        setCurrent(idx);
        clearTimeout(timeoutRef.current);
    };

    const handleLogout = async () => {
        await logout()<
        navigate("/Login", { replace: true });
    }

    return (
        <>
            <header className="header">
                <div className="container">
                    <Link to="/" className="logo leckerli-one-regular">
                        <img src={logo} alt="FocusApp" className="logo-image" />
                        <span className="logo-text">FocusApp</span>
                    </Link>

                    {/* Navbar con clase dinámica */}
                    <nav className={`navbar ${isOpen ? "active" : ""}`} id="navbar">
                        <ul className="nav_list">
                            <li><a href="#about">Nosotros</a></li>
                            <li><a href="#funciones">Funciones</a></li>
                            <li><a href="#ranking">Ranking</a></li>
                            <Link to="/concursos">Concursos</Link>
                            <li><Link to="/Perfil">Perfil</Link></li>
                            <li><Link to="/Subir">Subir Foto</Link></li>
                            <li>
                                <button onClick={handleLogout} className="logout-btn">
                                    Cerrar sesión
                                </button>
                            </li>
                        </ul>
                    </nav>

                    {/* Botón hamburguesa */}
                    <div
                        className={`menu-icon ${isOpen ? "open" : ""}`}
                        id="menu-btn"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <i className={isOpen ? "fas fa-times" : "fas fa-bars"}></i>
                    </div>
                </div>
            </header>

            <section className="home cover" id="home">
                <img src={portada} className="wave" alt="FocusApp portada" />
            </section>

            <section className="categories" id="categorias">
                <h1 className="heading">Categorías <span>Populares</span></h1>
                <div className="carousel-wrapper auto-carousel">
                    <div className="carousel-slide">
                        <img
                            src={categories[current].src}
                            alt={categories[current].label}
                            className="carousel-image-large"
                        />
                    
                        <h3>{categories[current].label}</h3>
                    </div>
                    <div className="carousel-pagination">
                        {categories.map((_, idx) => (
                            <button
                                key={idx}
                                className={`carousel-dot${current === idx ? " active" : ""}`}
                                onClick={() => goToSlide(idx)}
                                aria-label={`Ir a ${categories[idx].label}`}
                            />
                        ))}
                    </div>
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
            <section className="footer" id="footer">
                <div>
                    <div className="box">
                        <h3>Enlaces útiles</h3>
                        <div className="box-links">
                            <a href="/Homepage">Inicio</a>
                            <a href="#about">Sobre nosotros</a>
                            <a href="#funciones">Funciones</a>
                            <a href="#ranking">Ranking</a>
                            <a href="/concursos">Concursos</a>
                            <a href="/perfil">Perfil</a>
                            <a href="/subir">Subir Foto</a>
                            <a href="/inicio">Cerrar sesión</a>
                        </div>
                    </div>
                </div>
                <div className="credit">
                    <span>FocusApp</span> - Todos los derechos reservados &copy; 2025
                </div>

            </section>
        </>
    );
}

export default Homepage;

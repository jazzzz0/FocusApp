import React from "react";
import portada from '../assets/imagenes/portada.jpg';
import logo from '../assets/imagenes/logo.png';
import '../styles/Home.css';    
import '../styles/Bienvenida.css';

function Home() {
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
        </>
    );
}

export default Home;

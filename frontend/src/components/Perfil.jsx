import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/Perfil.css";
import Navbar from "./Navbar";
import Footer from "./Footer";
import CategoryPhotos from "./CategoryPhotos";
const Perfil = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("access");
      if (!token) {
        alert("Debes iniciar sesión para ver tu perfil.");
        return;
      }

      try {
        const username = localStorage.getItem("username");
        if (!username) {
          alert("No se encontró el nombre de usuario. Vuelve a iniciar sesión.");
          return;
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}users/${username}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = await response.json();
        console.log("Datos del usuario:", data);

        if (response.ok) {
          setUser(data);
        } else {
          console.error("Error al obtener usuario:", data);
          alert("No se pudo cargar el perfil.");
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      }
    };

    fetchUser();
  }, []);

  const handleEdit = () => {
    navigate("/editar-perfil");
  };

  return (
    <>
      <div className="perfil-wrapper">
        <Navbar />

        {/* 🔹 Contenido principal del perfil */}
        <div className="perfil-page">
          {user ? (
            <div className="perfil-card">
              <img
                src={
                  user.data.profile_pic ||
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt={`Foto de perfil de ${user.data.username}`}
              />
              <h2>@{user.data.username}</h2>
              <p>
                {user.data.first_name} {user.data.last_name}
              </p>

              <button className="btn" onClick={handleEdit}>
                ✍️ Editar perfil
              </button>

              {user.data.bio && <div className="bio">"{user.data.bio}"</div>}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10 p-4 animate-pulse">
              Cargando perfil... ⏳
            </div>
          )}
        </div>
        {/* 🔹 Fotos del usuario */}
        {user && (
          <div className="user-photos-section">
            <h3>Mis Fotos</h3>
            <CategoryPhotos customUrl={`${import.meta.env.VITE_API_BASE_URL}posts/?author=${user.data.id}&page_size=24`} />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Perfil;



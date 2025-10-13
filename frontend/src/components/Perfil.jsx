import React, { useEffect, useState } from "react";
import UserProfile from "./UserPerfil";
import "../styles/perfil.css";

const Perfil = () => {
  const [user, setUser] = useState(null);

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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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

  return (
    <div>
      <UserProfile user={user} />
    </div>
  );
};

export default Perfil;

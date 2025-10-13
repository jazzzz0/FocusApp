
import React, { useEffect, useState } from "react";


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
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}users/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await response.json();
        setUser(data);
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


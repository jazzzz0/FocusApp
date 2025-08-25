import React, { createContext, useState, useEffect } from "react";

// contexto de autenticación
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // usuario logueado
  const [loading, setLoading] = useState(true);

  // Cuando arranca la app, revisamos si hay un token en localStorage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setUser({ token }); // acá se podría guardar más info del usuario si el backend la provee
    }
    setLoading(false);
  }, []);

  // Función para loguear
  const login = async (credentials) => {
    try {
      const res = await fetch("http://localhost:8000/api/login", { // 🔹 cambia la URL según tu backend
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include", // importante si tu backend devuelve cookies HttpOnly
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();

      if (data.token) {
        // Guardamos el token (⚠️ para producción, mejor HttpOnly cookies desde el backend)
        localStorage.setItem("token", data.token);
        setUser({ token: data.token });
      }

      return true;
    } catch (err) {
      console.error("Error en login:", err);
      return false;
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

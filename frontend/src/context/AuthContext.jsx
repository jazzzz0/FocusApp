import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);   // usuario logueado
  const [loading, setLoading] = useState(true);


  // Cuando arranca la app, revisamos si hay tokens en localStorage
  useEffect(() => {
    const initializeUser = async () => {
      const access = localStorage.getItem("access");
      const refresh = localStorage.getItem("refresh");
      
      if (access && refresh) {
        const userInfo = await fetchCurrentUser(access);
        
        if (userInfo) {
          setUser({ access, refresh, ...userInfo });
        } else {
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          localStorage.removeItem("username");
        }
      }
      
      setLoading(false);
    };

    initializeUser();
  }, []);

  const fetchCurrentUser = async (accessToken) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/me/`, {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      return data.success ? data.data : null;
    } catch (err) {
      console.error("Error fetching current user:", err);
      return null;
    }
  };

  const login = async (credentials) => {
    try {
      const loginData = {
        username: credentials.username,
        password: credentials.password
      };
      
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/token/`, { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) {
        return false;
      }

      const data = await res.json();

      if (data.access && data.refresh) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        localStorage.setItem("username", credentials.username);

        const userInfo = await fetchCurrentUser(data.access);
        
        setUser({ 
          access: data.access, 
          refresh: data.refresh,
          ...userInfo
        });
      }

      return true;
    } catch (err) {
      console.error("Error en login:", err);
      return false;
    }
  };


  const logout = async () => {
    try {
      const access = user?.access || localStorage.getItem("access");
      const refresh = user?.refresh || localStorage.getItem("refresh");
      
      if (refresh) {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${access}`,
          },
          body: JSON.stringify({ refresh }),
        });

        // Si la petición no fue exitosa, no limpiar localStorage
        if (!response.ok) {
          return false;
        }
      }

      // Solo limpiar localStorage si el logout fue exitoso
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("username");
      setUser(null);
      return true;
    } catch (err) {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
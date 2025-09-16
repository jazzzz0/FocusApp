import { useNavigate } from "react-router-dom";
import React from "react";

const CerrarSesion = () => {
  const navigate = useNavigate();   
    const handleCerrarSesion = () => {
         localStorage.removeItem("access");
         localStorage.removeItem("refresh");
        navigate("/login");
    };

    return (
        <button onClick={handleCerrarSesion} className="btn btn-danger">
            Cerrar Sesión
        </button>
    );
}
export default CerrarSesion;
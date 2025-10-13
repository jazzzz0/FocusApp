import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterForm.css';
import { Link } from "react-router-dom";

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    date_of_birth: '',
    country: '',
    province: '',
    profile_pic: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formDataToSend.append(key, value);
        }
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}users/register/`,
        {
          method: "POST",
          body: formDataToSend,
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("✅ Usuario registrado exitosamente");
        navigate("/Login");
      } else {
        console.error("❌ Error al registrar:", data);
        alert("Error: " + (data.detail || JSON.stringify(data)));
      }
    } catch (error) {
      console.error("🚨 Error de conexión:", error);
      alert("Error de conexión con el servidor");
    }
  };

  return (
    <div className="register-form-center">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registro de Usuario</h2>

        <div className="form-grid">
          <div className="form-field">
            <label>Nombre</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              maxLength="150"
            />
          </div>

          <div className="form-field">
            <label>Apellido</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              maxLength="150"
            />
          </div>

          <div className="form-field">
            <label>Usuario *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              maxLength="150"
            />
          </div>

          <div className="form-field">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Contraseña *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>Fecha de nacimiento *</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-field">
            <label>País *</label>
            <input
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              maxLength="100"
            />
          </div>

          <div className="form-field">
            <label>Provincia *</label>
            <input
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              required
              maxLength="100"
            />
          </div>
        </div>

        <div className="form-field">
          <label>Foto de perfil</label>
          <div className="file-input-container">
            <input
              type="file"
              name="profile_pic"
              onChange={handleChange}
              accept="image/*"
              id="profile_pic"
              className="file-input-hidden"
            />
            <label htmlFor="profile_pic" className="file-input-label">
              <span className="file-input-icon">📷</span>
              <span className="file-input-text">
                {formData.profile_pic ? formData.profile_pic.name : 'Seleccionar imagen'}
              </span>
            </label>
          </div>
        </div>

        <button type="submit">Registrarse</button>

        <p>
          ¿Ya tienes cuenta? <Link to="/Login">Inicia sesión aquí</Link>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
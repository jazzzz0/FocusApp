import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterForm.css';
import { Link } from "react-router-dom";


const RegisterForm = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    date_of_birth: '',
    country: '',
    province: '',
    profile_picture: null, // ahora es un archivo
  });

  const navigate = useNavigate();

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'profile_picture') {
      setFormData({ ...formData, profile_picture: files[0] }); // Guardamos el archivo
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const dataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          dataToSend.append(key, formData[key]);
        }
      });

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/register/`, {
        method: 'POST',
        body: dataToSend, // Enviamos FormData
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario registrado exitosamente');
        navigate('/Homepage');
      } else {
        alert('Error: ' + JSON.stringify(data));
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión');
    }
  };

  return (
    <div className="register-form-center">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registro de Usuario</h2>

        <label>Nombre</label>
        <input 
          type="text" 
          name="first_name" 
          value={formData.first_name} 
          onChange={handleChange} 
          required 
          title="Campo obligatorio" 
        />

        <label>Apellido</label>
        <input 
          type="text" 
          name="last_name" 
          value={formData.last_name} 
          onChange={handleChange} 
          required 
          title="Campo obligatorio" 
        />

        <label>Usuario</label>
        <input 
          type="text" 
          name="username" 
          value={formData.username} 
          onChange={handleChange} 
          required 
          title="Campo obligatorio, mínimo 4 caracteres" 
        />

        <label>Email</label>
        <input 
          type="email" 
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          required 
          title="Debe ser un email válido" 
        />

        <label>Contraseña</label>
        <input 
          type="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange} 
          required 
          title="Debe tener al menos 8 caracteres" 
        />

        <label>Fecha de nacimiento</label>
        <input 
          type="date" 
          name="date_of_birth" 
          value={formData.date_of_birth} 
          onChange={handleChange} 
          required 
          title="Campo obligatorio" 
        />

        <label>Foto de perfil</label>
        <input 
          type="file" 
          name="profile_picture" 
          onChange={handleChange} 
          accept="image/*" 
          title="Sube una imagen de perfil (opcional)" 
        />

        <div className="form-row">
          <div>
            <label>País</label>
            <input 
              type="text" 
              name="country" 
              value={formData.country} 
              onChange={handleChange} 
              required 
              title="Campo obligatorio" 
            />
          </div>
          <div>
            <label>Provincia</label>
            <input 
              type="text" 
              name="province" 
              value={formData.province} 
              onChange={handleChange} 
              required 
              title="Campo obligatorio" 
            />
          </div>
        </div>

        <button type="submit">Registrarse</button>

        <p>¿Ya tienes cuenta? <Link to="/Login">Inicia sesión aquí</Link></p>
      </form>
    </div>
  );
};

export default RegisterForm;

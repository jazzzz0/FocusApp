import React, { useState } from 'react';
import '../styles/RegisterForm.css';

const RegisterForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Usuario registrado exitosamente');
      } else {
        alert('Error: ' + JSON.stringify(data));
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión');
    }
  };

  return (
    <div className="register-form-center">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Registro de Usuario</h2>
        <label>Usuario</label>
        <input type="text" name="username" value={formData.username} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Contraseña</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit">Registrarse</button>

        <a href=""></a>
      </form>
    </div>
  );
};

export default RegisterForm;

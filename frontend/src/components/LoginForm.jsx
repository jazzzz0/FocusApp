import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterForm.css'; 
import { Link } from "react-router-dom";
import '../components/RegisterForm';
const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
  e.preventDefault();
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // SimpleJWT espera 'username' y 'password'
      body: JSON.stringify({
        username: formData.username, 
        password: formData.password
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // SimpleJWT devuelve access y refresh
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('username', formData.username);
      alert('Login exitoso');
      navigate('/Homepage');
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
        <h2>Iniciar Sesión</h2>

        <label>Username</label>
        <input type="username" name="username" value={formData.username} onChange={handleChange} required />

        <label>Contraseña</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit">Iniciar Sesión</button>

        <p>¿No tienes cuenta? <Link to="/RegisterForm">Regístrate aquí</Link></p>
      </form>
    </div>
  );
};

export default LoginForm;

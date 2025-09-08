export default function Login() {
  return <h1>Página del login</h1>;
}

/* import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterForm.css'; 
import { Link } from "react-router-dom";
import '../components/RegisterForm';
const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token si el backend lo devuelve
        localStorage.setItem('token', data.token); 
        alert('Login exitoso');
        navigate('/Homepage'); // redirige al Homepage
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

        <label>Email</label>
        <input type="email" name="email" value={formData.email} onChange={handleChange} required />

        <label>Contraseña</label>
        <input type="password" name="password" value={formData.password} onChange={handleChange} required />

        <button type="submit">Iniciar Sesión</button>

        <p>¿No tienes cuenta? <Link to="/RegisterForm">Regístrate aquí</Link></p>
      </form>
    </div>
  );
};

export default LoginForm;
 */
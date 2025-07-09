
import React, { useState } from 'react';
import './App.css';
import logo from './assets/logo.png'; 

function App() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    birthDate: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    alert(`Registrado: ${form.firstName} ${form.lastName}`);
  };

  return (
    <div className="container">
      <img src={logo} alt="Logo" className="logo" />
      <h2>Crear cuenta</h2>
      <p className="subtitle">Fácil y rápido</p>

      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" placeholder="Nombre" onChange={handleChange} required />
        <input type="text" name="lastName" placeholder="Apellido" onChange={handleChange} required />
        <input type="text" name="username" placeholder="Nombre de usuario" onChange={handleChange} required />
        <input type="date" name="birthDate" onChange={handleChange} required />
        <input type="email" name="email" placeholder="Tuemail@ejemplo.com" onChange={handleChange} required />
        <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
        <input type="password" name="confirmPassword" placeholder="Confirmar contraseña" onChange={handleChange} required />
        <button type="submit">Continuar</button>
      </form>

      <div className="divider">o iniciar con Google</div>
      <button className="google-button">
        <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
        Google
      </button>

      <p className="terms">
        Al registrarte, aceptas los <a href="#">Términos del servicio</a> y la <a href="#">Política de privacidad</a> de SiriusCode.
      </p>

      <p className="login-link">
        ¿Ya sos miembro? <a href="#">Iniciar sesión</a>
      </p>
    </div>
  );
}

export default App;

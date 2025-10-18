import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterForm.css'; 
import { Link } from "react-router-dom";
import '../components/RegisterForm';
import { Snackbar, Alert } from '@mui/material';
const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const navigate = useNavigate();

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleSubmit = async e => {
  e.preventDefault();
  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/token/`, {
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
      showSnackbar('Login exitoso', 'success');
      setTimeout(() => navigate("/"), 700);
    } else {
      showSnackbar('Error: Credenciales inválidas', 'error');
    }
  } catch (error) {
    console.error(error);
    showSnackbar('Error de conexión', 'error');
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
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default LoginForm;

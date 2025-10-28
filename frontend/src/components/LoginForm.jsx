import React, { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import '../styles/RegisterForm.css'
import { Link } from 'react-router-dom'
import { Snackbar, Alert } from '@mui/material'
import { AuthContext } from '../context/AuthContext'
const LoginForm = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const location = useLocation()

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    try {
      const success = await login(formData)

      if (success) {
        showSnackbar('Login exitoso', 'success')
        setTimeout(() => navigate(location.state?.from?.pathname || '/'), 700)
      } else {
        showSnackbar('Error: Credenciales inválidas', 'error')
      }
    } catch (error) {
      console.error(error)
      showSnackbar('Error de conexión', 'error')
    }
  }

  return (
    <div className="register-form-center">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Iniciar Sesión</h2>

        <label>Username</label>
        <input
          type="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label>Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Iniciar Sesión</button>

        <p>
          ¿No tienes cuenta? <Link to="/RegisterForm">Regístrate aquí</Link>
        </p>
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
  )
}

export default LoginForm

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Snackbar, Alert } from '@mui/material'
import '../styles/Perfil.css'
import Navbar from './Navbar'
import Footer from './Footer'
import CategoryPhotos from './CategoryPhotos'
const Perfil = () => {
  const [user, setUser] = useState(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error',
  })
  const navigate = useNavigate()

  const showSnackbar = (message, severity = 'error') => {
    setSnackbar({
      open: true,
      message,
      severity,
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }))
  }

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('access')
      if (!token) {
        showSnackbar('Debes iniciar sesión para ver tu perfil.', 'warning')
        setTimeout(() => navigate('/login'), 2000)
        return
      }

      try {
        const username = localStorage.getItem('username')
        if (!username) {
          showSnackbar(
            'No se encontró el nombre de usuario. Vuelve a iniciar sesión.',
            'error'
          )
          return
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}users/${username}/`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        const data = await response.json()

        if (response.ok) {
          setUser(data)
        } else {
          console.error('Error al obtener usuario:', data)
          showSnackbar('No se pudo cargar el perfil.', 'error')
        }
      } catch (error) {
        console.error('Error al cargar el perfil:', error)
      }
    }

    fetchUser()
  })

  const handleEdit = () => {
    navigate('/editar-perfil')
  }

  return (
    <>
      <div className="perfil-wrapper">
        <Navbar />

        {/* 🔹 Contenido principal del perfil */}
        <div className="perfil-page">
          {user ? (
            <div className="perfil-card">
              <img
                src={
                  user.data.profile_pic ||
                  'https://cdn-icons-png.flaticon.com/512/149/149071.png'
                }
                alt={`Foto de perfil de ${user.data.username}`}
              />
              <div className="user-info">
                <h2>@{user.data.username}</h2>
                <p>
                  {user.data.first_name} {user.data.last_name}
                </p>
                <button className="btn" onClick={handleEdit}>
                  ✍️ Editar perfil
                </button>
              </div>

              {user.data.bio && <div className="bio">"{user.data.bio}"</div>}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                color: '#555',
                marginTop: '10px',
                padding: '4px',
                animation: 'pulse 1.5s infinite',
              }}
            >
              Cargando perfil... ⏳
            </div>
          )}
        </div>
        {/* 🔹 Fotos del usuario */}
        {user && (
          <div className="user-photos-section">
            <h3>Mis Fotos</h3>
            <CategoryPhotos
              customUrl={`${import.meta.env.VITE_API_BASE_URL}posts/?author=${user.data.id}&page_size=24`}
            />
          </div>
        )}
      </div>
      <Footer />

      {/* Snackbar para mostrar mensajes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}

export default Perfil

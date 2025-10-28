import React, { useState, useContext, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Home as HomeIcon,
} from '@mui/icons-material'
import { Snackbar, Alert } from '@mui/material'
import logo from '../assets/imagenes/logo.png'
import defaultAvatar from '../assets/imagenes/avatar.png'
import FloatingMenu from './FloatingMenu'
import NotificationBell from './NotificationBell'
import '../styles/Navbar.css'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })
  const [logoutSnackbar, setLogoutSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  })

  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, clearUser } = useContext(AuthContext)

  const handleCloseSnackbar = () =>
    setSnackbar(prev => ({ ...prev, open: false }))

  const handleLogout = async () => {
    const success = await logout()
    if (success) {
      setLogoutSnackbar({
        open: true,
        message: 'Sesión cerrada exitosamente',
        severity: 'success',
      })
    } else {
      setLogoutSnackbar({
        open: true,
        message: 'Error al cerrar sesión. Inténtalo de nuevo más tarde.',
        severity: 'error',
      })
    }

    setIsProfileMenuOpen(false)
    closeMobileMenu()

    // Redirigir después de mostrar el mensaje
    setTimeout(() => {
      navigate('/')
      setTimeout(() => {
        clearUser()
        setTimeout(() => {
          setLogoutSnackbar({ open: false, message: '', severity: 'success' })
        }, 1000)
      }, 200)
    }, 1500)
  }

  const handleProfileClick = () => {
    navigate('/perfil')
    setIsProfileMenuOpen(prev => !prev)
  }

  const closeMobileMenu = () => setIsOpen(false)

  useEffect(() => closeMobileMenu(), [location.pathname])

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo leckerli-one-regular">
          <img src={logo} alt="FocusApp" className="logo-image" />
          <span className="logo-text">FocusApp</span>
        </Link>

        <nav className={`navbar ${isOpen ? 'active' : ''}`}>
          <ul className="nav_list">
            {!user ? (
              <>
                <li>
                  <Link to="/Login" onClick={closeMobileMenu}>
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <Link to="/RegisterForm" onClick={closeMobileMenu}>
                    Registrarse
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/" onClick={closeMobileMenu}>
                    <HomeIcon fontSize="large" />
                  </Link>
                </li>

                <NotificationBell />

                <li
                  className="profile-menu-container"
                  onMouseEnter={() => setIsProfileMenuOpen(true)}
                  onMouseLeave={() => setIsProfileMenuOpen(false)}
                >
                  <Link to="/perfil" onClick={closeMobileMenu}>
                    <img
                      src={user.profile_pic || defaultAvatar}
                      alt="Perfil"
                      className="nav-avatar"
                    />
                  </Link>
                  {isProfileMenuOpen && (
                    <div className="profile-dropdown">
                      <button
                        className="dropdown-btn"
                        onClick={handleProfileClick}
                      >
                        Ver mi perfil
                      </button>
                      <button
                        className="dropdown-btn logout-btn"
                        onClick={handleLogout}
                      >
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </li>
              </>
            )}
          </ul>
        </nav>

        <div
          className={`menu-icon ${isOpen ? 'open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </div>

        {user && <FloatingMenu />}
      </div>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
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

      <Snackbar
        open={logoutSnackbar.open}
        autoHideDuration={null}
        onClose={() =>
          setLogoutSnackbar({ open: false, message: '', severity: 'success' })
        }
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() =>
            setLogoutSnackbar({ open: false, message: '', severity: 'success' })
          }
          severity={logoutSnackbar.severity}
          sx={{ width: '100%' }}
        >
          {logoutSnackbar.message}
        </Alert>
      </Snackbar>
    </header>
  )
}

export default Navbar

import { useContext } from 'react'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AddIcon from '@mui/icons-material/Add'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'
import ImageSearchIcon from '@mui/icons-material/ImageSearch'
import { Link } from 'react-router-dom'
import { CategoriesContext } from '../context/CategoriesContext'

import '../styles/Navbar.css'

const FloatingMenu = () => {
  const [showMenu, setShowMenu] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const navigate = useNavigate()
  const { categories } = useContext(CategoriesContext)
  const [showDropdown, setShowDropdown] = useState(false)
  const [hoverTimeout, setHoverTimeout] = useState(null)

  const closeAllMenus = () => {
    setShowOptions(false)
    setShowDropdown(false)
    // Delay para cerrar el menú principal después de que se oculten las opciones
    setTimeout(() => {
      setShowMenu(false)
    }, 200)
  }

  const handleMenuToggle = () => {
    if (showMenu) {
      setShowOptions(false)
      setTimeout(() => {
        setShowMenu(false)
      }, 200)
    } else {
      setShowMenu(true)
      setTimeout(() => {
        setShowOptions(true)
      }, 100)
    }
  }

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setShowDropdown(true)
  }

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setShowDropdown(false)
    }, 300)
    setHoverTimeout(timeout)
  }

  const isActive = path => {
    return window.location.pathname.startsWith(path)
  }

  // Cleanup del timeout cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  return (
    <div className="floating-menu">
      <button
        className={`float-btn ${showMenu ? 'rotated' : ''}`}
        onClick={handleMenuToggle}
      >
        <AddIcon fontSize="large" aria-label="add" />
      </button>

      {showMenu && (
        <div className={`float-options ${showOptions ? 'show' : ''}`}>
          <button
            onClick={() => {
              navigate('/subir')
              closeAllMenus()
            }}
            className="float-option"
          >
            <AddAPhotoIcon />{' '}
            <span className="float-option-text">Publicar</span>
          </button>

          {/* Contenedor para Descubrir y su dropdown */}
          <div
            className="discover-container"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="float-option"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <ImageSearchIcon />
              <span
                className={showDropdown ? 'active' : ''}
                style={{ fontSize: '1.1rem' }}
              >
                Descubrir
              </span>
            </button>

            {/* Dropdown menu que aparece debajo de Descubrir */}
            <ul className={`dropdown-menu ${showDropdown ? 'show' : ''}`}>
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link
                    to={`/explorar/${cat.slug}`}
                    className={
                      isActive(`/explorar/${cat.slug}`) ? 'active' : ''
                    }
                    onClick={closeAllMenus}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default FloatingMenu

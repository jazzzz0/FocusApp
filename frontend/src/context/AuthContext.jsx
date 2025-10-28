import React, { createContext, useState, useEffect, useCallback } from 'react'
import {
  setForceLogoutCallback,
  initializeFetchInterceptor,
} from '../utils/fetchInterceptor'
import { setNotificationLogoutCallback } from '../services/notificationService'
import {
  setAxiosForceLogoutCallback,
  initializeAxiosInterceptor,
} from '../utils/axiosInterceptor'

export const AuthContext = createContext() // eslint-disable-line react-refresh/only-export-components

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const forceLogout = useCallback(() => {
    localStorage.removeItem('access')
    localStorage.removeItem('refresh')
    localStorage.removeItem('username')
    // Limpiar el estado del usuario inmediatamente y sincrónicamente
    setUser(null)
    setIsLoggingOut(false)
    setLoading(false)

    if (
      window.location.pathname !== '/Login' &&
      window.location.pathname !== '/RegisterForm'
    ) {
      setTimeout(() => {
        window.location.href = '/Login'
      }, 2000)
    }
  }, [])

  // Configurar el callback para forceLogout al montar el componente
  useEffect(() => {
    setForceLogoutCallback(forceLogout)
    setNotificationLogoutCallback(forceLogout)
    setAxiosForceLogoutCallback(forceLogout)
    // Inicializar los interceptores globales
    initializeFetchInterceptor()
    initializeAxiosInterceptor()
  }, [forceLogout])

  // Cuando arranca la app, revisamos si hay tokens en localStorage
  useEffect(() => {
    const initializeUser = async () => {
      const access = localStorage.getItem('access')
      const refresh = localStorage.getItem('refresh')

      if (access && refresh) {
        const userInfo = await fetchCurrentUser(access)

        if (userInfo) {
          setUser({ access, refresh, ...userInfo })
        } else {
          localStorage.removeItem('access')
          localStorage.removeItem('refresh')
          localStorage.removeItem('username')
        }
      }

      setLoading(false)
    }

    initializeUser()
  }, [])

  const fetchCurrentUser = async accessToken => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}users/me/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!res.ok) {
        return null
      }

      const data = await res.json()
      return data.success ? data.data : null
    } catch (err) {
      console.error('Error fetching current user:', err)
      return null
    }
  }

  const login = async credentials => {
    try {
      const loginData = {
        username: credentials.username,
        password: credentials.password,
      }

      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}users/token/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginData),
        }
      )

      if (!res.ok) {
        return false
      }

      const data = await res.json()

      if (data.access && data.refresh) {
        localStorage.setItem('access', data.access)
        localStorage.setItem('refresh', data.refresh)
        localStorage.setItem('username', credentials.username)

        const userInfo = await fetchCurrentUser(data.access)

        setUser({
          access: data.access,
          refresh: data.refresh,
          ...userInfo,
        })
      }

      return true
    } catch (err) {
      console.error('Error en login:', err)
      return false
    }
  }

  const logout = async () => {
    try {
      setIsLoggingOut(true)
      const access = user?.access || localStorage.getItem('access')
      const refresh = user?.refresh || localStorage.getItem('refresh')

      if (refresh) {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}users/logout/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${access}`,
            },
            body: JSON.stringify({ refresh }),
          }
        )

        // Si la petición no fue exitosa, no limpiar localStorage
        if (!response.ok) {
          setIsLoggingOut(false)
          return false
        }
      }

      // Solo limpiar localStorage si el logout fue exitoso
      localStorage.removeItem('access')
      localStorage.removeItem('refresh')
      localStorage.removeItem('username')

      return true
    } catch (err) {
      setIsLoggingOut(false)
      return false
    }
  }

  const clearUser = () => {
    setUser(null)
    setTimeout(() => {
      setIsLoggingOut(false)
    }, 2000)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isLoggingOut,
        clearUser,
        forceLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider

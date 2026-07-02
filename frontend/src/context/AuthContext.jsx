import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('access_token')))

  useEffect(() => {
    if (!localStorage.getItem('access_token')) return
    api.get('/auth/me')
      .then(({ data }) => {
        setUser(data)
        localStorage.setItem('user', JSON.stringify(data))
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const saveSession = (data) => {
    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
  }

  const register = async (values) => {
    const { data } = await api.post('/auth/register', values)
    saveSession(data)
  }

  const login = async (values) => {
    const { data } = await api.post('/auth/login', values)
    saveSession(data)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const updateProfile = async (name) => {
    const { data } = await api.patch('/auth/me', { name })
    localStorage.setItem('user', JSON.stringify(data))
    setUser(data)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

// The context hook intentionally lives beside its provider for beginner-friendly imports.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext)

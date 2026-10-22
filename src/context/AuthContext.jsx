import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api from '../api/axiosConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On page load, ask the backend whether the cookie is still valid
  useEffect(() => {
    let active = true

    api
      .get('/auth/me')
      .then((res) => {
        if (active) setUser(res.data)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const login = useCallback(async (username, password) => {
    await api.post('/auth/login', { username, password })
    const res = await api.get('/auth/me')
    setUser(res.data)
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
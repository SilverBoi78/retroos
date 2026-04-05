import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || '/api'

async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const err = new Error(body.detail || `${res.status}: ${res.statusText}`)
    err.status = res.status
    throw err
  }
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('Server returned an invalid response')
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Check for existing session on mount, with a timeout safety net
  useEffect(() => {
    let cancelled = false
    let resolved = false

    const finish = (userData) => {
      if (cancelled || resolved) return
      resolved = true
      if (userData) setUser(userData)
      setLoading(false)
    }

    // Safety timeout — never stay on blank screen longer than 3 seconds
    const timeout = setTimeout(() => finish(null), 3000)

    apiFetch('/auth/me')
      .then((data) => finish(data))
      .catch(() => finish(null))
      .finally(() => clearTimeout(timeout))

    return () => { cancelled = true; clearTimeout(timeout) }
  }, [])

  const login = useCallback(async (username, password, sessionDuration = '7d') => {
    setAuthError(null)
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, sessionDuration }),
      })
      setUser(data)
    } catch (err) {
      const message = err.message === 'Failed to fetch'
        ? 'Could not connect to server. Please try again later.'
        : err.message
      setAuthError(message)
      throw err
    }
  }, [])

  const register = useCallback(async (username, password) => {
    setAuthError(null)
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      setUser(data)
    } catch (err) {
      const message = err.message === 'Failed to fetch'
        ? 'Could not connect to server. Please try again later.'
        : err.message
      setAuthError(message)
      throw err
    }
  }, [])

  const logout = useCallback(async () => {
    try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    setUser(null)
    setAuthError(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      authError,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

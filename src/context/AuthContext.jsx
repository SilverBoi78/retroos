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
  return res.json()
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  // Check for existing session on mount
  useEffect(() => {
    let cancelled = false
    apiFetch('/auth/me')
      .then((data) => {
        if (!cancelled) setUser(data)
      })
      .catch(() => {
        // 401 = not logged in, network error = backend down — either way, not authenticated
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
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
      setAuthError(err.message)
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
      setAuthError(err.message)
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

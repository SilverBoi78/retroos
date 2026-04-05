import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const API_BASE = import.meta.env.VITE_API_URL || '/api'
const STORAGE_KEY = 'retroos-user'

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
  const [isOfflineMode, setIsOfflineMode] = useState(false)

  // Check for existing session on mount
  useEffect(() => {
    let cancelled = false
    apiFetch('/auth/me')
      .then((data) => {
        if (!cancelled) {
          setUser(data)
          try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
        }
      })
      .catch((err) => {
        if (cancelled) return
        // Network error = backend unreachable, fall back to localStorage
        if (!err.status) {
          setIsOfflineMode(true)
          try {
            const stored = localStorage.getItem(STORAGE_KEY)
            if (stored) setUser(JSON.parse(stored))
          } catch {}
        }
        // 401 = not logged in, that's fine
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (username, password, sessionDuration = '7d') => {
    setAuthError(null)
    if (isOfflineMode) {
      // Fallback: mock login (same as before)
      const userData = { username, createdAt: new Date().toISOString() }
      setUser(userData)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(userData)) } catch {}
      return
    }
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password, sessionDuration }),
      })
      setUser(data)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [isOfflineMode])

  const register = useCallback(async (username, password) => {
    setAuthError(null)
    if (isOfflineMode) {
      const userData = { username, createdAt: new Date().toISOString() }
      setUser(userData)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(userData)) } catch {}
      return
    }
    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      })
      setUser(data)
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {}
    } catch (err) {
      setAuthError(err.message)
      throw err
    }
  }, [isOfflineMode])

  const logout = useCallback(async () => {
    if (!isOfflineMode) {
      try { await apiFetch('/auth/logout', { method: 'POST' }) } catch {}
    }
    setUser(null)
    setAuthError(null)
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
  }, [isOfflineMode])

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      loading,
      authError,
      isOfflineMode,
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

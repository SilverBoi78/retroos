import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getTheme, defaultThemeId } from '../themes'
import { useAuth } from './AuthContext'
import { API_BASE } from '../services/api'

const ThemeContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  const skip = new Set(['id', 'name'])

  Object.entries(theme).forEach(([key, value]) => {
    if (skip.has(key)) return
    root.style.setProperty(`--${key}`, value)
  })

  const borderStyle = theme['window-border-style'] || 'beveled'
  if (borderStyle === 'beveled') {
    root.style.setProperty('--border-raised',
      `inset -1px -1px 0 ${theme['color-surface-darker']}, inset 1px 1px 0 ${theme['color-surface-white'] || '#ffffff'}, inset -2px -2px 0 ${theme['color-surface-dark']}, inset 2px 2px 0 ${theme['color-surface-light']}`)
    root.style.setProperty('--border-sunken',
      `inset -1px -1px 0 ${theme['color-surface-white'] || '#ffffff'}, inset 1px 1px 0 ${theme['color-surface-darker']}, inset -2px -2px 0 ${theme['color-surface-light']}, inset 2px 2px 0 ${theme['color-surface-dark']}`)
    root.style.setProperty('--border-button',
      `inset -1px -1px 0 ${theme['color-surface-darker']}, inset 1px 1px 0 ${theme['color-surface-white'] || '#ffffff'}, inset -2px -2px 0 ${theme['color-surface-dark']}, inset 2px 2px 0 ${theme['color-surface-light']}`)
    root.style.setProperty('--border-button-pressed',
      `inset -1px -1px 0 ${theme['color-surface-white'] || '#ffffff'}, inset 1px 1px 0 ${theme['color-surface-darker']}, inset -2px -2px 0 ${theme['color-surface-light']}, inset 2px 2px 0 ${theme['color-surface-dark']}`)
    root.style.setProperty('--border-field',
      `inset -1px -1px 0 ${theme['color-surface-light']}, inset 1px 1px 0 ${theme['color-surface-dark']}, inset -2px -2px 0 ${theme['color-surface-white'] || '#ffffff'}, inset 2px 2px 0 ${theme['color-surface-darker']}`)
    root.style.setProperty('--border-window',
      `inset -1px -1px 0 #000000, inset 1px 1px 0 ${theme['color-surface-light']}, inset -2px -2px 0 ${theme['color-surface-dark']}, inset 2px 2px 0 ${theme['color-surface-white'] || '#ffffff'}`)
  } else {
    const borderColor = theme['color-surface-dark']
    root.style.setProperty('--border-raised', `inset 0 0 0 1px ${borderColor}`)
    root.style.setProperty('--border-sunken', `inset 0 0 0 1px ${borderColor}`)
    root.style.setProperty('--border-button', `inset 0 0 0 1px ${borderColor}`)
    root.style.setProperty('--border-button-pressed', `inset 0 0 0 1px ${theme['color-highlight']}`)
    root.style.setProperty('--border-field', `inset 0 0 0 1px ${borderColor}`)
    root.style.setProperty('--border-window', `0 0 0 1px ${borderColor}`)
  }

  root.style.setProperty('--color-title-active',
    `linear-gradient(90deg, ${theme['color-title-active-start']} 0%, ${theme['color-title-active-end']} 100%)`)
  root.style.setProperty('--color-title-inactive',
    `linear-gradient(90deg, ${theme['color-title-inactive-start']} 0%, ${theme['color-title-inactive-end']} 100%)`)
}

export function ThemeProvider({ children }) {
  const { isAuthenticated } = useAuth()

  const [themeId, setThemeId] = useState(() => {
    try {
      return localStorage.getItem('retroos-theme') || defaultThemeId
    } catch {
      return defaultThemeId
    }
  })

  const theme = getTheme(themeId)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Load theme from server when authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    fetch(`${API_BASE}/settings`, { credentials: 'include' })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.themeId && data.themeId !== themeId) {
          setThemeId(data.themeId)
          try { localStorage.setItem('retroos-theme', data.themeId) } catch {}
        }
      })
      .catch(() => {})
  }, [isAuthenticated])

  const switchTheme = useCallback((id) => {
    setThemeId(id)
    try {
      localStorage.setItem('retroos-theme', id)
    } catch {}
    // Sync to server if authenticated
    if (isAuthenticated) {
      fetch(`${API_BASE}/settings`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ themeId: id }),
      }).catch(() => {})
    }
  }, [isAuthenticated])

  return (
    <ThemeContext.Provider value={{ themeId, theme, switchTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { getTheme, defaultThemeId } from '../themes'
import { apiFetch } from '../services/api'

const ThemeContext = createContext(null)

function applyTheme(theme) {
  const root = document.documentElement
  const skip = new Set(['id', 'name'])

  Object.entries(theme).forEach(([key, value]) => {
    if (skip.has(key)) return
    root.style.setProperty(`--${key}`, value)
  })

  const white = theme['color-surface-white'] || '#ffffff'
  const borderStyle = theme['window-border-style'] || 'beveled'

  if (borderStyle === 'beveled') {
    const dd = theme['color-surface-darker']
    const d = theme['color-surface-dark']
    const l = theme['color-surface-light']
    root.style.setProperty('--border-raised',
      `inset -1px -1px 0 ${dd}, inset 1px 1px 0 ${white}, inset -2px -2px 0 ${d}, inset 2px 2px 0 ${l}`)
    root.style.setProperty('--border-sunken',
      `inset -1px -1px 0 ${white}, inset 1px 1px 0 ${dd}, inset -2px -2px 0 ${l}, inset 2px 2px 0 ${d}`)
    root.style.setProperty('--border-button',
      `inset -1px -1px 0 ${dd}, inset 1px 1px 0 ${white}, inset -2px -2px 0 ${d}, inset 2px 2px 0 ${l}`)
    root.style.setProperty('--border-button-pressed',
      `inset -1px -1px 0 ${white}, inset 1px 1px 0 ${dd}, inset -2px -2px 0 ${l}, inset 2px 2px 0 ${d}`)
    root.style.setProperty('--border-field',
      `inset -1px -1px 0 ${l}, inset 1px 1px 0 ${d}, inset -2px -2px 0 ${white}, inset 2px 2px 0 ${dd}`)
    root.style.setProperty('--border-window',
      `inset -1px -1px 0 #000000, inset 1px 1px 0 ${l}, inset -2px -2px 0 ${d}, inset 2px 2px 0 ${white}`)
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
  const [themeId, setThemeId] = useState(defaultThemeId)
  const theme = getTheme(themeId)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const switchTheme = useCallback((id) => {
    setThemeId(id)
    apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify({ themeId: id }),
    }).catch(() => {})
  }, [])

  return (
    <ThemeContext.Provider value={{ themeId, theme, setThemeId, switchTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}

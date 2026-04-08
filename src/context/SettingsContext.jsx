import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { apiFetch, API_BASE } from '../services/api'
import { useTheme } from './ThemeContext'

const SettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  wallpaper: { type: 'theme', value: null },
  accentColor: null,
  iconSize: 'medium',
  fontSize: 'medium',
  clockFormat: '24h',
}

const ICON_SIZES = { small: '24px', medium: '32px', large: '48px' }
const FONT_SIZES = { small: '10px', medium: '11px', large: '13px' }

function applySettingsToCSS(settings, themeId) {
  const root = document.documentElement

  // Icon size
  const iconPx = ICON_SIZES[settings.iconSize] || ICON_SIZES.medium
  root.style.setProperty('--icon-size', iconPx)

  // Font size
  const fontPx = FONT_SIZES[settings.fontSize] || FONT_SIZES.medium
  root.style.setProperty('--font-size-base', fontPx)

  // Accent color overrides
  if (settings.accentColor) {
    root.style.setProperty('--color-highlight', settings.accentColor)
    root.style.setProperty('--color-menu-hover', settings.accentColor)
    root.style.setProperty('--color-title-active-start', settings.accentColor)
    root.style.setProperty('--color-title-active-end', lighten(settings.accentColor, 30))
    root.style.setProperty('--color-title-active',
      `linear-gradient(90deg, ${settings.accentColor} 0%, ${lighten(settings.accentColor, 30)} 100%)`)
  }
}

function lighten(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount)
  const b = Math.min(255, (num & 0x0000FF) + amount)
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

export function SettingsProvider({ children }) {
  const { themeId } = useTheme()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [hasWallpaper, setHasWallpaper] = useState(false)
  const [wallpaperUrl, setWallpaperUrl] = useState(null)
  const [ready, setReady] = useState(false)

  // Load settings from API on mount
  useEffect(() => {
    let cancelled = false
    apiFetch('/settings')
      .then((data) => {
        if (cancelled) return
        if (data.settings) setSettings(s => ({ ...DEFAULT_SETTINGS, ...data.settings }))
        setHasWallpaper(!!data.hasWallpaper)
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => { cancelled = true }
  }, [])

  // Build wallpaper URL with cache-busting when hasWallpaper changes
  useEffect(() => {
    if (hasWallpaper) {
      setWallpaperUrl(`${API_BASE}/settings/wallpaper?t=${Date.now()}`)
    } else {
      setWallpaperUrl(null)
    }
  }, [hasWallpaper])

  // Apply CSS overrides whenever settings or theme changes
  useEffect(() => {
    if (ready) applySettingsToCSS(settings, themeId)
  }, [settings, themeId, ready])

  const updateSettings = useCallback(async (patch) => {
    const next = { ...settings, ...patch }
    setSettings(next)
    apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings: patch }),
    }).catch(err => console.error('[Settings sync]', err.message))
  }, [settings])

  const uploadWallpaper = useCallback(async (file) => {
    const res = await fetch(`${API_BASE}/settings/wallpaper`, {
      method: 'POST',
      body: file,
      credentials: 'include',
      headers: { 'Content-Type': file.type },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.detail || 'Upload failed')
    }
    setHasWallpaper(true)
    setSettings(s => ({ ...s, wallpaper: { type: 'image', value: 'custom' } }))
  }, [])

  const removeWallpaper = useCallback(async () => {
    await apiFetch('/settings/wallpaper', { method: 'DELETE' })
    setHasWallpaper(false)
    setWallpaperUrl(null)
    setSettings(s => ({ ...s, wallpaper: { type: 'theme', value: null } }))
  }, [])

  if (!ready) return null

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      uploadWallpaper,
      removeWallpaper,
      hasWallpaper,
      wallpaperUrl,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) throw new Error('useSettings must be used within SettingsProvider')
  return context
}

import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react'
import { apiFetch, API_BASE } from '../services/api'
import { useTheme } from './ThemeContext'
import { useNotification } from './NotificationContext'
import { getCursorPreset } from '../themes/cursorPresets'
import { registerCustomTheme } from '../themes'
import { setSoundConfig } from '../sounds'

const SettingsContext = createContext(null)

const DEFAULT_SETTINGS = {
  wallpaper: { type: 'theme', value: null },
  accentColor: null,
  iconSize: 'medium',
  fontSize: 'medium',
  clockFormat: '24h',
  cursorTheme: 'default',
  screenSaver: { enabled: false, type: 'starfield', timeout: 5 },
  sounds: {
    enabled: true,
    packId: 'retro',
    volume: 0.5,
    events: {
      windowOpen: true,
      windowClose: true,
      windowMinimize: true,
      windowMaximize: true,
      notification: true,
      login: true,
      startup: true,
    },
  },
}

const ICON_SIZES = { small: '24px', medium: '32px', large: '48px' }
const FONT_SCALES = { small: 0.91, medium: 1, large: 1.18 }

function lighten(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount)
  const b = Math.min(255, (num & 0x0000FF) + amount)
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

function applySettingsToCSS(settings) {
  const root = document.documentElement

  root.style.setProperty('--icon-size', ICON_SIZES[settings.iconSize] || ICON_SIZES.medium)

  const scale = FONT_SCALES[settings.fontSize] || 1
  root.style.setProperty('--font-size-xs', `${Math.round(9 * scale)}px`)
  root.style.setProperty('--font-size-sm', `${Math.round(10 * scale)}px`)
  root.style.setProperty('--font-size-base', `${Math.round(11 * scale)}px`)
  root.style.setProperty('--font-size-lg', `${Math.round(12 * scale)}px`)
  root.style.setProperty('--font-size-xl', `${Math.round(13 * scale)}px`)

  if (settings.accentColor) {
    root.style.setProperty('--color-highlight', settings.accentColor)
    root.style.setProperty('--color-menu-hover', settings.accentColor)
    root.style.setProperty('--color-title-active-start', settings.accentColor)
    root.style.setProperty('--color-title-active-end', lighten(settings.accentColor, 30))
    root.style.setProperty('--color-title-active',
      `linear-gradient(90deg, ${settings.accentColor} 0%, ${lighten(settings.accentColor, 30)} 100%)`)
  }

  const cursorPreset = getCursorPreset(settings.cursorTheme)
  root.style.setProperty('--cursor-default', cursorPreset.cursors.default)
  root.style.setProperty('--cursor-pointer', cursorPreset.cursors.pointer)
}

export function SettingsProvider({ children }) {
  const { themeId, setThemeId } = useTheme()
  const { notify } = useNotification()
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)
  const [hasWallpaper, setHasWallpaper] = useState(false)
  const [wallpaperVersion, setWallpaperVersion] = useState(0)
  const [ready, setReady] = useState(false)
  const settingsRef = useRef(settings)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  const wallpaperUrl = hasWallpaper ? `${API_BASE}/settings/wallpaper?v=${wallpaperVersion}` : null

  useEffect(() => {
    let cancelled = false
    apiFetch('/settings')
      .then((data) => {
        if (cancelled) return
        if (data.themeId) setThemeId(data.themeId)
        if (data.settings) {
          setSettings(() => ({ ...DEFAULT_SETTINGS, ...data.settings }))
          if (data.settings.customTheme) registerCustomTheme(data.settings.customTheme)
        }
        setHasWallpaper(!!data.hasWallpaper)
        setReady(true)
      })
      .catch(() => {
        if (!cancelled) setReady(true)
      })
    return () => { cancelled = true }
  }, [setThemeId])

  useEffect(() => {
    if (ready) applySettingsToCSS(settings)
  }, [settings, themeId, ready])

  useEffect(() => {
    if (settings.sounds) setSoundConfig(settings.sounds)
  }, [settings.sounds])

  const updateSettings = useCallback((patch) => {
    const previous = settingsRef.current
    setSettings({ ...previous, ...patch })
    apiFetch('/settings', {
      method: 'PUT',
      body: JSON.stringify({ settings: patch }),
    }).catch((err) => {
      setSettings(previous)
      notify(`Failed to save: ${err.message}`, { type: 'error' })
    })
  }, [notify])

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
    setWallpaperVersion(v => v + 1)
    setSettings(s => ({ ...s, wallpaper: { type: 'image', value: 'custom' } }))
  }, [])

  const removeWallpaper = useCallback(async () => {
    await apiFetch('/settings/wallpaper', { method: 'DELETE' })
    setHasWallpaper(false)
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

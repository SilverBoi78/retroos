import { useState, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useSettings } from '../../context/SettingsContext'
import { getThemeList, themes } from '../../themes'
import { gradients, patterns, getPresetCSS } from './wallpaperPresets'
import './Personalization.css'

const TABS = ['Themes', 'Wallpaper', 'Colors', 'Display']

export default function Personalization() {
  const [tab, setTab] = useState('Themes')

  return (
    <div className="personalization">
      <div className="personalization__tabs">
        {TABS.map(t => (
          <button
            key={t}
            className={`personalization__tab ${tab === t ? 'personalization__tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="personalization__content">
        {tab === 'Themes' && <ThemesTab />}
        {tab === 'Wallpaper' && <WallpaperTab />}
        {tab === 'Colors' && <ColorsTab />}
        {tab === 'Display' && <DisplayTab />}
      </div>
    </div>
  )
}

// ── Themes Tab ───────────────────────────────────────────────────────────────

function ThemesTab() {
  const { themeId, switchTheme } = useTheme()
  const themeList = getThemeList()

  return (
    <div className="personalization__section">
      <h3 className="personalization__section-title">Themes</h3>
      <p className="personalization__section-desc">Choose a theme for your desktop.</p>
      <div className="personalization__grid">
        {themeList.map((t) => (
          <button
            key={t.id}
            className={`personalization__card ${themeId === t.id ? 'personalization__card--active' : ''}`}
            onClick={() => switchTheme(t.id)}
          >
            <ThemePreview themeId={t.id} />
            <span className="personalization__card-label">{t.name}</span>
            {themeId === t.id && <span className="personalization__check">&#10003;</span>}
          </button>
        ))}
      </div>
    </div>
  )
}

function ThemePreview({ themeId }) {
  const theme = themes[themeId]
  if (!theme) return null
  return (
    <div className="personalization__preview" style={{ background: theme['color-desktop-bg'] }}>
      <div className="personalization__preview-window" style={{ background: theme['color-surface'] }}>
        <div className="personalization__preview-titlebar"
          style={{ background: `linear-gradient(90deg, ${theme['color-title-active-start']}, ${theme['color-title-active-end']})` }} />
        <div className="personalization__preview-body" />
      </div>
      <div className="personalization__preview-taskbar" style={{ background: theme['color-taskbar-bg'] }} />
    </div>
  )
}

// ── Wallpaper Tab ────────────────────────────────────────────────────────────

function WallpaperTab() {
  const { settings, updateSettings, uploadWallpaper, removeWallpaper, hasWallpaper, wallpaperUrl } = useSettings()
  const fileInput = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const wp = settings.wallpaper || { type: 'theme', value: null }

  function selectPreset(type, value) {
    updateSettings({ wallpaper: { type, value } })
  }

  async function handleFileSelect(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }
    setError(null)
    setUploading(true)
    try {
      await uploadWallpaper(file)
    } catch (err) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  const isActive = (type, value) =>
    wp.type === type && wp.value === value

  return (
    <div className="personalization__section">
      <h3 className="personalization__section-title">Wallpaper</h3>

      {/* Theme default */}
      <div className="personalization__subsection">
        <label className="personalization__label">Default</label>
        <div className="personalization__grid">
          <button
            className={`personalization__card ${wp.type === 'theme' ? 'personalization__card--active' : ''}`}
            onClick={() => selectPreset('theme', null)}
          >
            <div className="personalization__wp-thumb personalization__wp-thumb--theme">
              Theme
            </div>
            <span className="personalization__card-label">Use Theme</span>
          </button>
        </div>
      </div>

      {/* Solid color */}
      <div className="personalization__subsection">
        <label className="personalization__label">Solid Color</label>
        <div className="personalization__row">
          <input
            type="color"
            className="personalization__color-input"
            value={wp.type === 'color' ? wp.value : '#2c5f6e'}
            onChange={(e) => selectPreset('color', e.target.value)}
          />
          {wp.type === 'color' && (
            <span className="personalization__color-value">{wp.value}</span>
          )}
        </div>
      </div>

      {/* Gradients */}
      <div className="personalization__subsection">
        <label className="personalization__label">Gradients</label>
        <div className="personalization__grid personalization__grid--small">
          {gradients.map(g => (
            <button
              key={g.id}
              className={`personalization__card ${isActive('gradient', g.id) ? 'personalization__card--active' : ''}`}
              onClick={() => selectPreset('gradient', g.id)}
              title={g.name}
            >
              <div className="personalization__wp-thumb" style={{ background: g.css }} />
              <span className="personalization__card-label">{g.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Patterns */}
      <div className="personalization__subsection">
        <label className="personalization__label">Patterns</label>
        <div className="personalization__grid personalization__grid--small">
          {patterns.map(p => (
            <button
              key={p.id}
              className={`personalization__card ${isActive('pattern', p.id) ? 'personalization__card--active' : ''}`}
              onClick={() => selectPreset('pattern', p.id)}
              title={p.name}
            >
              <div className="personalization__wp-thumb" style={getPresetCSS(p)} />
              <span className="personalization__card-label">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom image upload */}
      <div className="personalization__subsection">
        <label className="personalization__label">Custom Image</label>
        <div className="personalization__row">
          <button
            className="personalization__btn"
            onClick={() => fileInput.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Choose Image...'}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
          {hasWallpaper && wp.type === 'image' && (
            <button className="personalization__btn personalization__btn--danger" onClick={removeWallpaper}>
              Remove
            </button>
          )}
        </div>
        {error && <p className="personalization__error">{error}</p>}
        {hasWallpaper && wallpaperUrl && (
          <div className="personalization__wp-preview-large">
            <img src={wallpaperUrl} alt="Current wallpaper" />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Colors Tab ───────────────────────────────────────────────────────────────

function ColorsTab() {
  const { settings, updateSettings } = useSettings()
  const { theme } = useTheme()

  const accent = settings.accentColor
  const themeDefault = theme['color-highlight']

  return (
    <div className="personalization__section">
      <h3 className="personalization__section-title">Accent Color</h3>
      <p className="personalization__section-desc">
        Customize the accent color used for title bars, selections, and menus.
      </p>

      <div className="personalization__subsection">
        <div className="personalization__row">
          <input
            type="color"
            className="personalization__color-input"
            value={accent || themeDefault}
            onChange={(e) => updateSettings({ accentColor: e.target.value })}
          />
          <span className="personalization__color-value">
            {accent || themeDefault}
          </span>
          {accent && (
            <button
              className="personalization__btn"
              onClick={() => updateSettings({ accentColor: null })}
            >
              Reset to Theme Default
            </button>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="personalization__subsection">
        <label className="personalization__label">Preview</label>
        <div className="personalization__accent-preview">
          <div className="personalization__accent-bar"
            style={{ background: `linear-gradient(90deg, ${accent || themeDefault}, ${lightenHex(accent || themeDefault, 30)})` }}>
            <span>Title Bar</span>
          </div>
          <div className="personalization__accent-swatch" style={{ background: accent || themeDefault }}>
            Selected Item
          </div>
          <div className="personalization__accent-btn-row">
            <span className="personalization__accent-menu-item" style={{ background: accent || themeDefault }}>
              Menu Hover
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function lightenHex(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, (num >> 16) + amount)
  const g = Math.min(255, ((num >> 8) & 0xFF) + amount)
  const b = Math.min(255, (num & 0xFF) + amount)
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`
}

// ── Display Tab ──────────────────────────────────────────────────────────────

function DisplayTab() {
  const { settings, updateSettings } = useSettings()

  return (
    <div className="personalization__section">
      {/* Icon Size */}
      <div className="personalization__subsection">
        <h3 className="personalization__section-title">Icon Size</h3>
        <div className="personalization__option-group">
          {[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ].map(opt => (
            <label key={opt.value} className="personalization__radio">
              <input
                type="radio"
                name="iconSize"
                checked={settings.iconSize === opt.value}
                onChange={() => updateSettings({ iconSize: opt.value })}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className="personalization__subsection">
        <h3 className="personalization__section-title">Font Size</h3>
        <div className="personalization__option-group">
          {[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ].map(opt => (
            <label key={opt.value} className="personalization__radio">
              <input
                type="radio"
                name="fontSize"
                checked={settings.fontSize === opt.value}
                onChange={() => updateSettings({ fontSize: opt.value })}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clock Format */}
      <div className="personalization__subsection">
        <h3 className="personalization__section-title">Clock Format</h3>
        <div className="personalization__option-group">
          <label className="personalization__radio">
            <input
              type="radio"
              name="clockFormat"
              checked={settings.clockFormat === '12h'}
              onChange={() => updateSettings({ clockFormat: '12h' })}
            />
            <span>12-hour (1:30 PM)</span>
          </label>
          <label className="personalization__radio">
            <input
              type="radio"
              name="clockFormat"
              checked={settings.clockFormat === '24h'}
              onChange={() => updateSettings({ clockFormat: '24h' })}
            />
            <span>24-hour (13:30)</span>
          </label>
        </div>
      </div>
    </div>
  )
}

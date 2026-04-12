import { useState, useRef } from 'react'
import { useTheme } from '../../context/ThemeContext'
import { useSettings } from '../../context/SettingsContext'
import { getThemeList, themes, registerCustomTheme, getCustomTheme, getTheme } from '../../themes'
import { gradients, patterns, getPresetCSS } from './wallpaperPresets'
import { cursorPresets } from '../../themes/cursorPresets'
import { retroClassic } from '../../themes/themes'
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

const THEME_COLOR_GROUPS = [
  { label: 'Desktop', keys: ['color-desktop-bg'] },
  { label: 'Window Chrome', keys: ['color-surface', 'color-surface-dark', 'color-surface-light'] },
  { label: 'Title Bar (Active)', keys: ['color-title-active-start', 'color-title-active-end', 'color-title-text-active'] },
  { label: 'Title Bar (Inactive)', keys: ['color-title-inactive-start', 'color-title-inactive-end', 'color-title-text-inactive'] },
  { label: 'Text', keys: ['color-text-primary', 'color-text-secondary', 'color-text-disabled'] },
  { label: 'Accents', keys: ['color-highlight', 'color-highlight-text'] },
  { label: 'UI Elements', keys: ['color-button-face', 'color-taskbar-bg', 'color-start-menu-bg', 'color-input-bg', 'color-menu-hover', 'color-menu-hover-text'] },
]

function friendlyKeyName(key) {
  return key
    .replace('color-', '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

function ThemesTab() {
  const { themeId, switchTheme, applyTheme } = useTheme()
  const { settings, updateSettings } = useSettings()
  const [editing, setEditing] = useState(false)
  const themeList = getThemeList()
  const previousThemeRef = useRef(null)

  function handleCreateCustom() {
    const existing = getCustomTheme()
    const base = existing || { ...retroClassic }
    previousThemeRef.current = themeId
    setEditing({ ...base, id: 'custom', name: existing?.name || 'My Theme' })
  }

  function handleEditCustom() {
    const existing = getCustomTheme()
    if (!existing) return
    previousThemeRef.current = themeId
    setEditing({ ...existing })
  }

  function handleBaseThemeChange(baseId) {
    const base = themes[baseId]
    if (!base) return
    setEditing(prev => ({
      ...base,
      id: 'custom',
      name: prev.name,
    }))
    applyTheme({ ...base, id: 'custom' })
  }

  function handleColorChange(key, value) {
    setEditing(prev => {
      const next = { ...prev, [key]: value }
      applyTheme(next)
      return next
    })
  }

  function handleNameChange(name) {
    setEditing(prev => ({ ...prev, name }))
  }

  function handleStyleChange(key, value) {
    setEditing(prev => {
      const next = { ...prev, [key]: value }
      applyTheme(next)
      return next
    })
  }

  function handleSave() {
    const themeData = { ...editing }
    registerCustomTheme(themeData)
    updateSettings({ customTheme: themeData })
    switchTheme('custom')
    setEditing(false)
  }

  function handleCancel() {
    if (previousThemeRef.current) {
      switchTheme(previousThemeRef.current)
    }
    setEditing(false)
  }

  function handleDeleteCustom() {
    registerCustomTheme(null)
    updateSettings({ customTheme: null })
    if (themeId === 'custom') {
      switchTheme('retro-classic')
    }
  }

  if (editing) {
    return (
      <div className="personalization__section">
        <h3 className="personalization__section-title">Custom Theme Editor</h3>

        <div className="personalization__subsection">
          <label className="personalization__label">Theme Name</label>
          <input
            type="text"
            className="personalization__theme-name-input"
            value={editing.name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="My Theme"
          />
        </div>

        <div className="personalization__subsection">
          <label className="personalization__label">Start From</label>
          <div className="personalization__option-group">
            {Object.values(themes).map(t => (
              <button
                key={t.id}
                className="personalization__btn"
                onClick={() => handleBaseThemeChange(t.id)}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {THEME_COLOR_GROUPS.map(group => (
          <div key={group.label} className="personalization__subsection">
            <label className="personalization__label">{group.label}</label>
            <div className="personalization__color-row">
              {group.keys.map(key => (
                <div key={key} className="personalization__color-field">
                  <input
                    type="color"
                    className="personalization__color-input"
                    value={editing[key] || '#000000'}
                    onChange={(e) => handleColorChange(key, e.target.value)}
                  />
                  <span className="personalization__color-key">{friendlyKeyName(key)}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="personalization__subsection">
          <label className="personalization__label">Border Style</label>
          <div className="personalization__option-group">
            <label className="personalization__radio">
              <input
                type="radio"
                name="borderStyle"
                checked={editing['window-border-style'] === 'beveled'}
                onChange={() => handleStyleChange('window-border-style', 'beveled')}
              />
              <span>Beveled</span>
            </label>
            <label className="personalization__radio">
              <input
                type="radio"
                name="borderStyle"
                checked={editing['window-border-style'] === 'flat'}
                onChange={() => handleStyleChange('window-border-style', 'flat')}
              />
              <span>Flat</span>
            </label>
          </div>
        </div>

        <div className="personalization__subsection">
          <label className="personalization__label">Border Radius</label>
          <div className="personalization__row">
            <input
              type="range"
              min="0"
              max="6"
              value={parseInt(editing['border-radius']) || 0}
              onChange={(e) => handleStyleChange('border-radius', `${e.target.value}px`)}
            />
            <span className="personalization__color-value">{editing['border-radius']}</span>
          </div>
        </div>

        <div className="personalization__row" style={{ marginTop: 8 }}>
          <button className="personalization__btn" onClick={handleSave}>Save Theme</button>
          <button className="personalization__btn" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    )
  }

  const hasCustom = !!getCustomTheme()

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
            <ThemePreviewBox themeData={getTheme(t.id)} />
            <span className="personalization__card-label">{t.name}</span>
            {themeId === t.id && <span className="personalization__check">&#10003;</span>}
          </button>
        ))}
        <button
          className="personalization__card personalization__card--create"
          onClick={handleCreateCustom}
        >
          <div className="personalization__preview personalization__preview--create">
            <span>+</span>
          </div>
          <span className="personalization__card-label">{hasCustom ? 'New Custom' : 'Create Custom'}</span>
        </button>
      </div>
      {hasCustom && (
        <div className="personalization__row" style={{ marginTop: 8 }}>
          <button className="personalization__btn" onClick={handleEditCustom}>Edit Custom Theme</button>
          <button className="personalization__btn personalization__btn--danger" onClick={handleDeleteCustom}>Delete Custom Theme</button>
        </div>
      )}
    </div>
  )
}

function ThemePreviewBox({ themeData }) {
  if (!themeData) return null
  return (
    <div className="personalization__preview" style={{ background: themeData['color-desktop-bg'] }}>
      <div className="personalization__preview-window" style={{ background: themeData['color-surface'] }}>
        <div className="personalization__preview-titlebar"
          style={{ background: `linear-gradient(90deg, ${themeData['color-title-active-start']}, ${themeData['color-title-active-end']})` }} />
        <div className="personalization__preview-body" />
      </div>
      <div className="personalization__preview-taskbar" style={{ background: themeData['color-taskbar-bg'] }} />
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

      {/* Cursor Theme */}
      <div className="personalization__subsection">
        <h3 className="personalization__section-title">Cursor</h3>
        <div className="personalization__option-group">
          {cursorPresets.map(preset => (
            <label key={preset.id} className="personalization__radio">
              <input
                type="radio"
                name="cursorTheme"
                checked={(settings.cursorTheme || 'default') === preset.id}
                onChange={() => updateSettings({ cursorTheme: preset.id })}
              />
              <span>{preset.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Screen Saver */}
      <div className="personalization__subsection">
        <h3 className="personalization__section-title">Screen Saver</h3>
        <div className="personalization__option-group">
          <label className="personalization__radio">
            <input
              type="checkbox"
              checked={settings.screenSaver?.enabled || false}
              onChange={(e) => updateSettings({ screenSaver: { ...settings.screenSaver, enabled: e.target.checked } })}
            />
            <span>Enable screen saver</span>
          </label>
        </div>
        {settings.screenSaver?.enabled && (
          <>
            <label className="personalization__label">Animation</label>
            <div className="personalization__option-group">
              {[
                { id: 'starfield', name: 'Starfield' },
                { id: 'matrix', name: 'Matrix Rain' },
                { id: 'bouncing', name: 'Bouncing Logo' },
              ].map(anim => (
                <label key={anim.id} className="personalization__radio">
                  <input
                    type="radio"
                    name="screenSaverType"
                    checked={(settings.screenSaver?.type || 'starfield') === anim.id}
                    onChange={() => updateSettings({ screenSaver: { ...settings.screenSaver, type: anim.id } })}
                  />
                  <span>{anim.name}</span>
                </label>
              ))}
            </div>
            <label className="personalization__label">Timeout</label>
            <div className="personalization__option-group">
              {[
                { value: 1, label: '1 min' },
                { value: 3, label: '3 min' },
                { value: 5, label: '5 min' },
                { value: 10, label: '10 min' },
                { value: 15, label: '15 min' },
              ].map(opt => (
                <label key={opt.value} className="personalization__radio">
                  <input
                    type="radio"
                    name="screenSaverTimeout"
                    checked={(settings.screenSaver?.timeout || 5) === opt.value}
                    onChange={() => updateSettings({ screenSaver: { ...settings.screenSaver, timeout: opt.value } })}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

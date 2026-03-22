import { useTheme } from '../../context/ThemeContext'
import { getThemeList } from '../../themes'
import './Personalization.css'

export default function Personalization() {
  const { themeId, switchTheme } = useTheme()
  const themes = getThemeList()

  return (
    <div className="personalization">
      <div className="personalization__section">
        <h3 className="personalization__section-title">Themes</h3>
        <p className="personalization__section-desc">Choose a theme for your desktop.</p>
        <div className="personalization__themes">
          {themes.map((theme) => (
            <button
              key={theme.id}
              className={`personalization__theme ${themeId === theme.id ? 'personalization__theme--active' : ''}`}
              onClick={() => switchTheme(theme.id)}
            >
              <ThemePreview themeId={theme.id} />
              <span className="personalization__theme-name">{theme.name}</span>
              {themeId === theme.id && <span className="personalization__theme-check">✓</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ThemePreview({ themeId }) {
  const previews = {
    'retro-classic': {
      desktop: '#2c5f6e',
      chrome: '#d4d0c8',
      titleBar: 'linear-gradient(90deg, #6b4c8a, #9b7bb8)',
      accent: '#6b4c8a',
    },
    'arctic': {
      desktop: '#1a1d23',
      chrome: '#2a2d35',
      titleBar: 'linear-gradient(90deg, #3a6fa0, #5a8fc0)',
      accent: '#3a6fa0',
    },
    'olive': {
      desktop: '#4a5a3a',
      chrome: '#d4d0c0',
      titleBar: 'linear-gradient(90deg, #5a6a3a, #7a8a5a)',
      accent: '#5a6a3a',
    },
  }

  const p = previews[themeId] || previews['retro-classic']

  return (
    <div className="personalization__preview" style={{ background: p.desktop }}>
      <div className="personalization__preview-window" style={{ background: p.chrome }}>
        <div className="personalization__preview-titlebar" style={{ background: p.titleBar }} />
        <div className="personalization__preview-body" />
      </div>
      <div className="personalization__preview-taskbar" style={{ background: p.chrome }} />
    </div>
  )
}

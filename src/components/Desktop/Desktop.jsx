import { useCallback, useMemo } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useContextMenu } from '../../context/ContextMenuContext'
import { useSettings } from '../../context/SettingsContext'
import { getApp } from '../../registry/appRegistry'
import appRegistry from '../../registry/appRegistry'
import { gradients, patterns, getPresetCSS } from '../../apps/Personalization/wallpaperPresets'
import DesktopIcon from '../DesktopIcon/DesktopIcon'
import Window from '../Window/Window'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import Taskbar from '../Taskbar/Taskbar'
import NotificationArea from '../NotificationArea/NotificationArea'
import ContextMenu from '../ContextMenu/ContextMenu'
import './Desktop.css'

function useWallpaperStyle() {
  const { settings, wallpaperUrl } = useSettings()
  const wp = settings.wallpaper || { type: 'theme', value: null }

  return useMemo(() => {
    if (wp.type === 'color') {
      return { background: wp.value }
    }
    if (wp.type === 'gradient') {
      const preset = gradients.find(g => g.id === wp.value)
      return preset ? getPresetCSS(preset) : {}
    }
    if (wp.type === 'pattern') {
      const preset = patterns.find(p => p.id === wp.value)
      return preset ? getPresetCSS(preset) : {}
    }
    if (wp.type === 'image' && wallpaperUrl) {
      return {
        backgroundImage: `url(${wallpaperUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    }
    return {} // 'theme' type — use CSS vars (default)
  }, [wp.type, wp.value, wallpaperUrl])
}

export default function Desktop() {
  const { windows, openWindow } = useWindowManager()
  const { showContextMenu } = useContextMenu()
  const wallpaperStyle = useWallpaperStyle()

  const handleDesktopContextMenu = useCallback((e) => {
    if (e.target.closest('.window') || e.target.closest('.taskbar') || e.target.closest('.desktop-icon')) return
    showContextMenu(e, [
      { label: 'Open Terminal', action: () => openWindow('terminal') },
      { label: 'Open File Manager', action: () => openWindow('filemanager') },
      { type: 'divider' },
      { label: 'Personalization', action: () => openWindow('personalization') },
    ])
  }, [showContextMenu, openWindow])

  return (
    <div className="desktop" style={wallpaperStyle} onContextMenu={handleDesktopContextMenu}>
      <div className="desktop__icons">
        {appRegistry.filter(app => !app.systemApp).map((app) => (
          <DesktopIcon
            key={app.id}
            appId={app.id}
            label={app.title}
            icon={app.icon}
          />
        ))}
      </div>

      <div className="desktop__windows">
        {windows.map((win) => {
          const app = getApp(win.appId)
          if (!app) return null
          const AppComponent = app.component
          return (
            <Window key={win.id} windowData={win}>
              <ErrorBoundary>
                <AppComponent windowId={win.id} appProps={win.appProps} />
              </ErrorBoundary>
            </Window>
          )
        })}
      </div>

      <ContextMenu />
      <NotificationArea />
      <Taskbar />
    </div>
  )
}

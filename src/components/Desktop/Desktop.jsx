import { useCallback } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useContextMenu } from '../../context/ContextMenuContext'
import { getApp } from '../../registry/appRegistry'
import appRegistry from '../../registry/appRegistry'
import DesktopIcon from '../DesktopIcon/DesktopIcon'
import Window from '../Window/Window'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import Taskbar from '../Taskbar/Taskbar'
import NotificationArea from '../NotificationArea/NotificationArea'
import ContextMenu from '../ContextMenu/ContextMenu'
import './Desktop.css'

export default function Desktop() {
  const { windows, openWindow } = useWindowManager()
  const { showContextMenu } = useContextMenu()

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
    <div className="desktop" onContextMenu={handleDesktopContextMenu}>
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

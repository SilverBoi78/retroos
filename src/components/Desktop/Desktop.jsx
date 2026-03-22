import { useWindowManager } from '../../context/WindowManagerContext'
import { getApp } from '../../registry/appRegistry'
import appRegistry from '../../registry/appRegistry'
import DesktopIcon from '../DesktopIcon/DesktopIcon'
import Window from '../Window/Window'
import ErrorBoundary from '../ErrorBoundary/ErrorBoundary'
import Taskbar from '../Taskbar/Taskbar'
import './Desktop.css'

export default function Desktop() {
  const { windows } = useWindowManager()

  return (
    <div className="desktop">
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

      <Taskbar />
    </div>
  )
}

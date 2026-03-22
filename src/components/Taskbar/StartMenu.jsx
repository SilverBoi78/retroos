import { useEffect, useRef } from 'react'
import appRegistry from '../../registry/appRegistry'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useAuth } from '../../context/AuthContext'
import './StartMenu.css'

export default function StartMenu({ onClose }) {
  const { openWindow } = useWindowManager()
  const { user, logout } = useAuth()
  const menuRef = useRef(null)

  const userApps = appRegistry.filter(app => !app.systemApp)
  const systemApps = appRegistry.filter(app => app.systemApp)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  function handleAppClick(appId) {
    openWindow(appId)
    onClose()
  }

  function handleLogOff() {
    onClose()
    logout()
  }

  return (
    <div className="start-menu" ref={menuRef}>
      <div className="start-menu__header">
        <span className="start-menu__logo">RetroOS</span>
        {user && <span className="start-menu__user">{user.username}</span>}
      </div>
      <div className="start-menu__apps">
        {userApps.map((app) => (
          <button
            key={app.id}
            className="start-menu__app"
            onClick={() => handleAppClick(app.id)}
          >
            <span className="start-menu__app-name">{app.title}</span>
          </button>
        ))}
      </div>
      {systemApps.length > 0 && (
        <>
          <div className="start-menu__divider" />
          <div className="start-menu__apps">
            {systemApps.map((app) => (
              <button
                key={app.id}
                className="start-menu__app"
                onClick={() => handleAppClick(app.id)}
              >
                <span className="start-menu__app-name">{app.title}</span>
              </button>
            ))}
          </div>
        </>
      )}
      <div className="start-menu__divider" />
      <div className="start-menu__apps">
        <button className="start-menu__app" onClick={handleLogOff}>
          <span className="start-menu__app-name">Log Off</span>
        </button>
      </div>
      <div className="start-menu__footer">
        <span className="start-menu__version">v0.1.0</span>
      </div>
    </div>
  )
}

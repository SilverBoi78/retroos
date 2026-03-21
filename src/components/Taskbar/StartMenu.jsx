import { useEffect, useRef } from 'react'
import appRegistry from '../../registry/appRegistry'
import { useWindowManager } from '../../context/WindowManagerContext'
import './StartMenu.css'

export default function StartMenu({ onClose }) {
  const { openWindow } = useWindowManager()
  const menuRef = useRef(null)

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

  return (
    <div className="start-menu" ref={menuRef}>
      <div className="start-menu__header">
        <span className="start-menu__logo">RetroOS</span>
      </div>
      <div className="start-menu__apps">
        {appRegistry.map((app) => (
          <button
            key={app.id}
            className="start-menu__app"
            onClick={() => handleAppClick(app.id)}
          >
            <span className="start-menu__app-name">{app.title}</span>
          </button>
        ))}
      </div>
      <div className="start-menu__footer">
        <span className="start-menu__version">v0.1.0</span>
      </div>
    </div>
  )
}

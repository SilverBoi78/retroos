import { useState, useCallback } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useContextMenu } from '../../context/ContextMenuContext'
import { getIcon } from '../../registry/appIcons'
import './DesktopIcon.css'

export default function DesktopIcon({ appId, label, icon }) {
  const { openWindow } = useWindowManager()
  const { showContextMenu } = useContextMenu()
  const [selected, setSelected] = useState(false)

  function handleDoubleClick() {
    openWindow(appId)
  }

  function handleClick(e) {
    e.stopPropagation()
    setSelected(true)
  }

  const handleContextMenu = useCallback((e) => {
    e.stopPropagation()
    setSelected(true)
    showContextMenu(e, [
      { label: 'Open', action: () => openWindow(appId) },
    ])
  }, [showContextMenu, openWindow, appId])

  const iconElement = getIcon(icon)

  return (
    <button
      className={`desktop-icon ${selected ? 'desktop-icon--selected' : ''}`}
      onDoubleClick={handleDoubleClick}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onBlur={() => setSelected(false)}
    >
      <div className="desktop-icon__image">
        {iconElement || <div className="desktop-icon__placeholder" />}
      </div>
      <span className="desktop-icon__label">{label}</span>
    </button>
  )
}

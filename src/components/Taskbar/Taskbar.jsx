import { useState, useMemo } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import StartMenu from './StartMenu'
import TaskbarClock from './TaskbarClock'
import './Taskbar.css'

export default function Taskbar() {
  const { windows, focusWindow, restoreWindow, minimizeWindow } = useWindowManager()
  const [startMenuOpen, setStartMenuOpen] = useState(false)

  const topZIndex = useMemo(() => {
    if (windows.length === 0) return 0
    return Math.max(...windows.filter(w => !w.minimized).map(w => w.zIndex))
  }, [windows])

  function handleWindowClick(win) {
    if (win.minimized) {
      restoreWindow(win.id)
    } else if (win.zIndex === topZIndex) {
      minimizeWindow(win.id)
    } else {
      focusWindow(win.id)
    }
  }

  return (
    <>
      {startMenuOpen && <StartMenu onClose={() => setStartMenuOpen(false)} />}
      <div className="taskbar">
        <button
          className={`taskbar__start ${startMenuOpen ? 'taskbar__start--active' : ''}`}
          onClick={() => setStartMenuOpen(!startMenuOpen)}
        >
          <span className="taskbar__start-icon">◈</span>
          <span className="taskbar__start-text">RetroOS</span>
        </button>

        <div className="taskbar__divider" />

        <div className="taskbar__windows">
          {windows.map((win) => (
            <button
              key={win.id}
              className={`taskbar__window-btn ${
                !win.minimized && win.zIndex === topZIndex ? 'taskbar__window-btn--active' : ''
              }`}
              onClick={() => handleWindowClick(win)}
            >
              {win.title}
            </button>
          ))}
        </div>

        <div className="taskbar__spacer" />
        <div className="taskbar__divider" />
        <TaskbarClock />
      </div>
    </>
  )
}

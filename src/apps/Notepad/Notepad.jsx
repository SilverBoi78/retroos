import { useState, useRef, useEffect } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import './Notepad.css'

export default function Notepad({ windowId }) {
  const [content, setContent] = useState('')
  const [menuOpen, setMenuOpen] = useState(null)
  const { closeWindow } = useWindowManager()
  const menuRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(null)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  function handleNew() {
    setContent('')
    setMenuOpen(null)
  }

  function handleClose() {
    closeWindow(windowId)
  }

  function handleSelectAll() {
    textareaRef.current?.select()
    setMenuOpen(null)
  }

  function handleKeyDown(e) {
    if (e.ctrlKey && e.key === 'n') {
      e.preventDefault()
      handleNew()
    } else if (e.ctrlKey && e.key === 's') {
      e.preventDefault()
      alert('Save is not yet implemented.')
    } else if (e.ctrlKey && e.key === 'a') {
      e.preventDefault()
      handleSelectAll()
    }
  }

  const menus = {
    file: [
      { label: 'New', shortcut: 'Ctrl+N', action: handleNew },
      { label: 'Save', shortcut: 'Ctrl+S', action: () => { alert('Save is not yet implemented.'); setMenuOpen(null) } },
      { type: 'divider' },
      { label: 'Close', action: handleClose },
    ],
    edit: [
      { label: 'Select All', shortcut: 'Ctrl+A', action: handleSelectAll },
    ],
  }

  return (
    <div className="notepad" onKeyDown={handleKeyDown}>
      <div className="notepad__menubar" ref={menuRef}>
        {Object.keys(menus).map((key) => (
          <div key={key} className="notepad__menu-wrapper">
            <button
              className={`notepad__menu-trigger ${menuOpen === key ? 'notepad__menu-trigger--active' : ''}`}
              onClick={() => setMenuOpen(menuOpen === key ? null : key)}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </button>
            {menuOpen === key && (
              <div className="notepad__dropdown">
                {menus[key].map((item, i) =>
                  item.type === 'divider' ? (
                    <div key={i} className="notepad__dropdown-divider" />
                  ) : (
                    <button
                      key={item.label}
                      className="notepad__dropdown-item"
                      onClick={item.action}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <span className="notepad__shortcut">{item.shortcut}</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      <textarea
        ref={textareaRef}
        className="notepad__editor"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
        spellCheck={false}
      />
    </div>
  )
}

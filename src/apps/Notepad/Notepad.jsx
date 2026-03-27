import { useState, useRef, useEffect } from 'react'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useFileSystem } from '../../context/FileSystemContext'
import { useNotification } from '../../context/NotificationContext'
import FileDialog from '../../components/FileDialog/FileDialog'
import './Notepad.css'

export default function Notepad({ windowId, appProps }) {
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')
  const [filePath, setFilePath] = useState(null)
  const [fileName, setFileName] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [dialog, setDialog] = useState(null)
  const { closeWindow, updateWindowTitle } = useWindowManager()
  const { readFile, writeFile } = useFileSystem()
  const { notify } = useNotification()
  const menuRef = useRef(null)
  const textareaRef = useRef(null)
  const hasLoadedFile = useRef(false)

  // Load file if opened from File Manager
  useEffect(() => {
    if (hasLoadedFile.current) return
    if (appProps?.filePath) {
      const fileContent = readFile(appProps.filePath)
      if (fileContent !== null) {
        setContent(fileContent)
        setSavedContent(fileContent)
        setFilePath(appProps.filePath)
        const parts = appProps.filePath.split('/')
        const name = parts[parts.length - 1]
        setFileName(name)
        updateWindowTitle(windowId, `${name} - Notepad`)
        hasLoadedFile.current = true
      }
    }
  }, [appProps, readFile, updateWindowTitle, windowId])

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

  const isDirty = content !== savedContent

  function handleNew() {
    setContent('')
    setSavedContent('')
    setFilePath(null)
    setFileName(null)
    updateWindowTitle(windowId, 'Notepad')
    setMenuOpen(null)
  }

  function handleSave() {
    setMenuOpen(null)
    if (filePath) {
      writeFile(filePath, content)
      setSavedContent(content)
      notify(`Saved ${fileName}`, { type: 'success' })
    } else {
      setDialog('save')
    }
  }

  function handleSaveAs() {
    setMenuOpen(null)
    setDialog('save')
  }

  function handleOpen() {
    setMenuOpen(null)
    setDialog('open')
  }

  function handleSaveConfirm(path, name) {
    writeFile(path, content)
    setSavedContent(content)
    setFilePath(path)
    setFileName(name)
    updateWindowTitle(windowId, `${name} - Notepad`)
    setDialog(null)
    notify(`Saved ${name}`, { type: 'success' })
  }

  function handleOpenConfirm(path, name) {
    const fileContent = readFile(path)
    if (fileContent !== null) {
      setContent(fileContent)
      setSavedContent(fileContent)
      setFilePath(path)
      setFileName(name)
      updateWindowTitle(windowId, `${name} - Notepad`)
    }
    setDialog(null)
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
      if (e.shiftKey) {
        handleSaveAs()
      } else {
        handleSave()
      }
    } else if (e.ctrlKey && e.key === 'o') {
      e.preventDefault()
      handleOpen()
    } else if (e.ctrlKey && e.key === 'a') {
      e.preventDefault()
      handleSelectAll()
    }
  }

  const menus = {
    file: [
      { label: 'New', shortcut: 'Ctrl+N', action: handleNew },
      { label: 'Open...', shortcut: 'Ctrl+O', action: handleOpen },
      { type: 'divider' },
      { label: 'Save', shortcut: 'Ctrl+S', action: handleSave },
      { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: handleSaveAs },
      { type: 'divider' },
      { label: 'Close', action: handleClose },
    ],
    edit: [
      { label: 'Select All', shortcut: 'Ctrl+A', action: handleSelectAll },
    ],
  }

  const titleSuffix = fileName || 'Untitled'

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
      {dialog === 'save' && (
        <FileDialog
          mode="save"
          defaultFileName={fileName || 'Untitled.txt'}
          onConfirm={handleSaveConfirm}
          onCancel={() => setDialog(null)}
        />
      )}
      {dialog === 'open' && (
        <FileDialog
          mode="open"
          defaultFileName=""
          onConfirm={handleOpenConfirm}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  )
}

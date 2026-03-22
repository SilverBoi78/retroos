import { useState, useEffect } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import './FileDialog.css'

export default function FileDialog({ mode, defaultFileName, onConfirm, onCancel }) {
  const { readDir, createDir } = useFileSystem()
  const [currentPath, setCurrentPath] = useState('/')
  const [fileName, setFileName] = useState(defaultFileName || '')
  const [selected, setSelected] = useState(null)
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const items = readDir(currentPath)
    if (items) {
      const sorted = [...items].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      setEntries(sorted)
    }
  }, [currentPath, readDir])

  function navigate(dirName) {
    const newPath = currentPath === '/' ? `/${dirName}` : `${currentPath}/${dirName}`
    setCurrentPath(newPath)
    setSelected(null)
  }

  function goUp() {
    if (currentPath === '/') return
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    setCurrentPath('/' + parts.join('/'))
    setSelected(null)
  }

  function handleItemClick(entry) {
    if (entry.type === 'directory') {
      setSelected(entry.name)
    } else {
      setSelected(entry.name)
      setFileName(entry.name)
    }
  }

  function handleItemDoubleClick(entry) {
    if (entry.type === 'directory') {
      navigate(entry.name)
    } else {
      setFileName(entry.name)
      handleConfirm(entry.name)
    }
  }

  function handleConfirm(nameOverride) {
    const name = nameOverride || fileName.trim()
    if (!name) return
    const fullPath = currentPath === '/' ? `/${name}` : `${currentPath}/${name}`
    onConfirm(fullPath, name)
  }

  function handleNewFolder() {
    const name = prompt('New folder name:')
    if (!name || !name.trim()) return
    const folderPath = currentPath === '/' ? `/${name.trim()}` : `${currentPath}/${name.trim()}`
    createDir(folderPath)
  }

  const title = mode === 'save' ? 'Save As' : 'Open'
  const confirmLabel = mode === 'save' ? 'Save' : 'Open'

  return (
    <div className="file-dialog__overlay">
      <div className="file-dialog">
        <div className="file-dialog__title-bar">
          <span>{title}</span>
        </div>
        <div className="file-dialog__body">
          <div className="file-dialog__toolbar">
            <button className="file-dialog__toolbar-btn" onClick={goUp} disabled={currentPath === '/'}>
              ↑ Up
            </button>
            <button className="file-dialog__toolbar-btn" onClick={handleNewFolder}>
              New Folder
            </button>
            <span className="file-dialog__path">{currentPath}</span>
          </div>

          <div className="file-dialog__list">
            {entries.length === 0 && (
              <div className="file-dialog__empty">(empty)</div>
            )}
            {entries.map((entry) => (
              <div
                key={entry.name}
                className={`file-dialog__item ${selected === entry.name ? 'file-dialog__item--selected' : ''}`}
                onClick={() => handleItemClick(entry)}
                onDoubleClick={() => handleItemDoubleClick(entry)}
              >
                <span className="file-dialog__item-icon">
                  {entry.type === 'directory' ? '📁' : '📄'}
                </span>
                <span className="file-dialog__item-name">{entry.name}</span>
              </div>
            ))}
          </div>

          <div className="file-dialog__footer">
            <div className="file-dialog__filename-row">
              <label className="file-dialog__label">File name:</label>
              <input
                className="file-dialog__input"
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm() }}
                autoFocus
              />
            </div>
            <div className="file-dialog__buttons">
              <button className="file-dialog__btn" onClick={() => handleConfirm()}>
                {confirmLabel}
              </button>
              <button className="file-dialog__btn" onClick={onCancel}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useContextMenu } from '../../context/ContextMenuContext'
import './FileManager.css'

export default function FileManager({ windowId }) {
  const { readDir, createDir, deleteNode, rename } = useFileSystem()
  const { openWindow } = useWindowManager()
  const { showContextMenu } = useContextMenu()
  const [currentPath, setCurrentPath] = useState('/')
  const [entries, setEntries] = useState([])
  const [selected, setSelected] = useState(null)
  const [renaming, setRenaming] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  useEffect(() => {
    const items = readDir(currentPath)
    if (items) {
      const sorted = [...items].sort((a, b) => {
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
        return a.name.localeCompare(b.name)
      })
      setEntries(sorted)
    } else {
      setEntries([])
    }
  }, [currentPath, readDir])

  function navigate(dirName) {
    const newPath = currentPath === '/' ? `/${dirName}` : `${currentPath}/${dirName}`
    setCurrentPath(newPath)
    setSelected(null)
    setRenaming(null)
  }

  function goUp() {
    if (currentPath === '/') return
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    setCurrentPath('/' + parts.join('/'))
    setSelected(null)
    setRenaming(null)
  }

  function handleItemClick(entry) {
    setSelected(entry.name)
    setRenaming(null)
  }

  function handleItemDoubleClick(entry) {
    if (entry.type === 'directory') {
      navigate(entry.name)
    } else {
      openWindow('notepad', {
        filePath: currentPath === '/' ? `/${entry.name}` : `${currentPath}/${entry.name}`,
      })
    }
  }

  function handleNewFolder() {
    const name = prompt('New folder name:')
    if (!name || !name.trim()) return
    const folderPath = currentPath === '/' ? `/${name.trim()}` : `${currentPath}/${name.trim()}`
    createDir(folderPath)
  }

  function handleDelete() {
    if (!selected) return
    const fullPath = currentPath === '/' ? `/${selected}` : `${currentPath}/${selected}`
    const entry = entries.find(e => e.name === selected)
    const label = entry?.type === 'directory' ? 'folder' : 'file'
    if (confirm(`Delete ${label} "${selected}"?`)) {
      deleteNode(fullPath)
      setSelected(null)
    }
  }

  function handleRename() {
    if (!selected) return
    setRenaming(selected)
    setRenameValue(selected)
  }

  function handleRenameConfirm() {
    if (!renaming || !renameValue.trim()) {
      setRenaming(null)
      return
    }
    if (renameValue.trim() !== renaming) {
      const fullPath = currentPath === '/' ? `/${renaming}` : `${currentPath}/${renaming}`
      rename(fullPath, renameValue.trim())
    }
    setSelected(renameValue.trim())
    setRenaming(null)
  }

  function handleKeyDown(e) {
    if (e.key === 'Delete' && selected && !renaming) {
      handleDelete()
    } else if (e.key === 'F2' && selected && !renaming) {
      handleRename()
    }
  }

  const handleItemContextMenu = useCallback((e, entry) => {
    e.stopPropagation()
    setSelected(entry.name)
    const fullPath = currentPath === '/' ? `/${entry.name}` : `${currentPath}/${entry.name}`
    const items = [
      { label: 'Open', action: () => handleItemDoubleClick(entry) },
      { type: 'divider' },
      { label: 'Rename', action: () => { setRenaming(entry.name); setRenameValue(entry.name) } },
      { label: 'Delete', action: () => {
        const label = entry.type === 'directory' ? 'folder' : 'file'
        if (confirm(`Delete ${label} "${entry.name}"?`)) {
          deleteNode(fullPath)
          setSelected(null)
        }
      }},
    ]
    showContextMenu(e, items)
  }, [currentPath, showContextMenu, deleteNode])

  const handleEmptyContextMenu = useCallback((e) => {
    if (e.target.closest('.filemanager__item')) return
    showContextMenu(e, [
      { label: 'New Folder', action: handleNewFolder },
    ])
  }, [showContextMenu])

  const pathParts = currentPath === '/' ? [''] : currentPath.split('/')

  return (
    <div className="filemanager" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="filemanager__toolbar">
        <button className="filemanager__toolbar-btn" onClick={goUp} disabled={currentPath === '/'}>
          ↑ Up
        </button>
        <button className="filemanager__toolbar-btn" onClick={handleNewFolder}>
          New Folder
        </button>
        <button className="filemanager__toolbar-btn" onClick={handleRename} disabled={!selected}>
          Rename
        </button>
        <button className="filemanager__toolbar-btn" onClick={handleDelete} disabled={!selected}>
          Delete
        </button>
      </div>

      <div className="filemanager__addressbar">
        <span className="filemanager__addressbar-label">Location:</span>
        <div className="filemanager__addressbar-path">
          {currentPath === '/' ? '/' : currentPath}
        </div>
      </div>

      <div className="filemanager__content" onClick={() => { setSelected(null); setRenaming(null) }} onContextMenu={handleEmptyContextMenu}>
        {entries.length === 0 && (
          <div className="filemanager__empty">This folder is empty</div>
        )}
        {entries.map((entry) => (
          <div
            key={entry.name}
            className={`filemanager__item ${selected === entry.name ? 'filemanager__item--selected' : ''}`}
            onClick={(e) => { e.stopPropagation(); handleItemClick(entry) }}
            onDoubleClick={() => handleItemDoubleClick(entry)}
            onContextMenu={(e) => handleItemContextMenu(e, entry)}
          >
            <span className="filemanager__item-icon">
              {entry.type === 'directory' ? '📁' : '📄'}
            </span>
            {renaming === entry.name ? (
              <input
                className="filemanager__rename-input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onBlur={handleRenameConfirm}
                onKeyDown={(e) => {
                  e.stopPropagation()
                  if (e.key === 'Enter') handleRenameConfirm()
                  if (e.key === 'Escape') setRenaming(null)
                }}
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="filemanager__item-name">{entry.name}</span>
            )}
            {entry.type === 'file' && entry.size !== null && (
              <span className="filemanager__item-size">{entry.size} B</span>
            )}
          </div>
        ))}
      </div>

      <div className="filemanager__statusbar">
        {entries.length} item{entries.length !== 1 ? 's' : ''}
        {selected && ` — "${selected}" selected`}
      </div>
    </div>
  )
}

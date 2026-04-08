import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { createFileSystem } from '../services/fileSystem'
import { fsApi } from '../services/fileSystemApi'

const FileSystemContext = createContext(null)

export function FileSystemProvider({ children }) {
  const fsRef = useRef(null)
  const [version, setVersion] = useState(0)
  const [ready, setReady] = useState(false)

  const bump = useCallback(() => setVersion(v => v + 1), [])

  // Load the user's filesystem from the API on mount
  useEffect(() => {
    let cancelled = false
    fsApi.loadTree()
      .then((tree) => {
        if (!cancelled) {
          fsRef.current = createFileSystem({ initialTree: tree, api: fsApi })
          setReady(true)
        }
      })
      .catch(() => {
        // If API fails, initialize with empty defaults so the UI doesn't break
        if (!cancelled) {
          fsRef.current = createFileSystem({ initialTree: { type: 'directory', children: {} }, api: fsApi })
          setReady(true)
        }
      })
    return () => { cancelled = true }
  }, [])

  // version in deps forces consumers to re-render when FS mutates (cache invalidation)
  const readDir = useCallback((path) => {
    return fsRef.current?.readDir(path) ?? null
  }, [version, ready])

  const readFile = useCallback((path) => {
    return fsRef.current?.readFile(path) ?? null
  }, [version, ready])

  const writeFile = useCallback((path, content) => {
    if (!fsRef.current) return false
    const ok = fsRef.current.writeFile(path, content)
    if (ok) bump()
    return ok
  }, [bump, ready])

  const createDir = useCallback((path) => {
    if (!fsRef.current) return false
    const ok = fsRef.current.createDir(path)
    if (ok) bump()
    return ok
  }, [bump, ready])

  const deleteNode = useCallback((path) => {
    if (!fsRef.current) return false
    const ok = fsRef.current.deleteNode(path)
    if (ok) bump()
    return ok
  }, [bump, ready])

  const rename = useCallback((path, newName) => {
    if (!fsRef.current) return false
    const ok = fsRef.current.rename(path, newName)
    if (ok) bump()
    return ok
  }, [bump, ready])

  const exists = useCallback((path) => {
    return fsRef.current?.exists(path) ?? false
  }, [version, ready])

  const getNodeType = useCallback((path) => {
    return fsRef.current?.getNodeType(path) ?? null
  }, [version, ready])

  if (!ready) return null

  return (
    <FileSystemContext.Provider value={{
      readDir, readFile, writeFile, createDir, deleteNode, rename, exists, getNodeType,
    }}>
      {children}
    </FileSystemContext.Provider>
  )
}

export function useFileSystem() {
  const context = useContext(FileSystemContext)
  if (!context) throw new Error('useFileSystem must be used within FileSystemProvider')
  return context
}

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { createFileSystem } from '../services/fileSystem'
import { fsApi } from '../services/fileSystemApi'
import { useAuth } from './AuthContext'

const FileSystemContext = createContext(null)

export function FileSystemProvider({ children }) {
  const { isOfflineMode } = useAuth()
  const fsRef = useRef(null)
  const [version, setVersion] = useState(0)
  const [ready, setReady] = useState(false)

  const bump = useCallback(() => setVersion(v => v + 1), [])

  // Initialize the filesystem — from API if online, from localStorage if offline
  useEffect(() => {
    if (isOfflineMode) {
      fsRef.current = createFileSystem()
      setReady(true)
      return
    }

    let cancelled = false
    fsApi.loadTree()
      .then((tree) => {
        if (!cancelled) {
          fsRef.current = createFileSystem({ initialTree: tree, api: fsApi })
          setReady(true)
        }
      })
      .catch(() => {
        // API failed, fall back to localStorage
        if (!cancelled) {
          fsRef.current = createFileSystem()
          setReady(true)
        }
      })
    return () => { cancelled = true }
  }, [isOfflineMode])

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

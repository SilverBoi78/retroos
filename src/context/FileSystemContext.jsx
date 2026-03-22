import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { createFileSystem } from '../services/fileSystem'

const FileSystemContext = createContext(null)

export function FileSystemProvider({ children }) {
  const fsRef = useRef(createFileSystem())
  const [version, setVersion] = useState(0)

  const bump = useCallback(() => setVersion(v => v + 1), [])

  const readDir = useCallback((path) => {
    return fsRef.current.readDir(path)
  }, [version])

  const readFile = useCallback((path) => {
    return fsRef.current.readFile(path)
  }, [version])

  const writeFile = useCallback((path, content) => {
    const ok = fsRef.current.writeFile(path, content)
    if (ok) bump()
    return ok
  }, [bump])

  const createDir = useCallback((path) => {
    const ok = fsRef.current.createDir(path)
    if (ok) bump()
    return ok
  }, [bump])

  const deleteNode = useCallback((path) => {
    const ok = fsRef.current.deleteNode(path)
    if (ok) bump()
    return ok
  }, [bump])

  const rename = useCallback((path, newName) => {
    const ok = fsRef.current.rename(path, newName)
    if (ok) bump()
    return ok
  }, [bump])

  const exists = useCallback((path) => {
    return fsRef.current.exists(path)
  }, [version])

  const getNodeType = useCallback((path) => {
    return fsRef.current.getNodeType(path)
  }, [version])

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

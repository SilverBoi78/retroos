import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { play } from '../sounds'

const NotificationContext = createContext(null)

let nextId = 1

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const timersRef = useRef({})

  const dismiss = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id])
      delete timersRef.current[id]
    }
  }, [])

  const notify = useCallback((message, options = {}) => {
    const id = nextId++
    const duration = options.duration || 3000
    const type = options.type || 'info'

    setNotifications(prev => [...prev, { id, message, type, createdAt: Date.now() }])
    if (type === 'error') play('error')
    else if (type === 'success') play('success')
    else play('notification')

    timersRef.current[id] = setTimeout(() => {
      dismiss(id)
    }, duration)

    return id
  }, [dismiss])

  return (
    <NotificationContext.Provider value={{ notifications, notify, dismiss }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useNotification must be used within NotificationProvider')
  return context
}

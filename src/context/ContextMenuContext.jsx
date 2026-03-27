import { createContext, useContext, useState, useCallback } from 'react'

const ContextMenuContext = createContext(null)

export function ContextMenuProvider({ children }) {
  const [menu, setMenu] = useState(null)

  const showContextMenu = useCallback((event, items) => {
    event.preventDefault()
    event.stopPropagation()
    setMenu({ x: event.clientX, y: event.clientY, items })
  }, [])

  const hideContextMenu = useCallback(() => setMenu(null), [])

  return (
    <ContextMenuContext.Provider value={{ menu, showContextMenu, hideContextMenu }}>
      {children}
    </ContextMenuContext.Provider>
  )
}

export function useContextMenu() {
  const context = useContext(ContextMenuContext)
  if (!context) throw new Error('useContextMenu must be used within ContextMenuProvider')
  return context
}

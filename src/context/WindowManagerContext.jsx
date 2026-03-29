import { createContext, useContext, useReducer, useCallback } from 'react'
import { getApp } from '../registry/appRegistry'

const WindowManagerContext = createContext(null)

const initialState = {
  windows: [],
  nextZIndex: 1,
}

function windowReducer(state, action) {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const app = getApp(action.appId)
      if (!app) return state

      if (!app.allowMultiple) {
        const existing = state.windows.find(w => w.appId === action.appId)
        if (existing) {
          return {
            ...state,
            windows: state.windows.map(w =>
              w.id === existing.id
                ? { ...w, minimized: false, zIndex: state.nextZIndex }
                : w
            ),
            nextZIndex: state.nextZIndex + 1,
          }
        }
      }

      const offset = (state.windows.length % 8) * 30
      const newWindow = {
        id: `${action.appId}-${Date.now()}`,
        appId: action.appId,
        title: app.title,
        position: { x: 120 + offset, y: 60 + offset },
        size: { ...app.defaultSize },
        minimized: false,
        maximized: false,
        zIndex: state.nextZIndex,
        appProps: action.appProps || null,
      }

      return {
        ...state,
        windows: [...state.windows, newWindow],
        nextZIndex: state.nextZIndex + 1,
      }
    }

    case 'CLOSE_WINDOW_START':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, closing: true } : w
        ),
      }

    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.filter(w => w.id !== action.id),
      }

    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, minimized: true } : w
        ),
      }

    case 'MAXIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id
            ? {
                ...w,
                maximized: true,
                preMaxPosition: w.position,
                preMaxSize: w.size,
                zIndex: state.nextZIndex,
              }
            : w
        ),
        nextZIndex: state.nextZIndex + 1,
      }

    case 'RESTORE_WINDOW':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id
            ? {
                ...w,
                minimized: false,
                maximized: false,
                position: w.preMaxPosition || w.position,
                size: w.preMaxSize || w.size,
                zIndex: state.nextZIndex,
              }
            : w
        ),
        nextZIndex: state.nextZIndex + 1,
      }

    case 'FOCUS_WINDOW': {
      const target = state.windows.find(w => w.id === action.id)
      if (target && target.zIndex === state.nextZIndex - 1) {
        return state
      }
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, zIndex: state.nextZIndex } : w
        ),
        nextZIndex: state.nextZIndex + 1,
      }
    }

    case 'UPDATE_POSITION':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, position: { x: action.x, y: action.y } } : w
        ),
      }

    case 'UPDATE_SIZE':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id
            ? { ...w, size: { width: action.width, height: action.height } }
            : w
        ),
      }

    case 'UPDATE_TITLE':
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.id ? { ...w, title: action.title } : w
        ),
      }

    default:
      return state
  }
}

export function WindowManagerProvider({ children }) {
  const [state, dispatch] = useReducer(windowReducer, initialState)

  const openWindow = useCallback((appId, appProps) => dispatch({ type: 'OPEN_WINDOW', appId, appProps }), [])
  const closeWindow = useCallback((id) => {
    dispatch({ type: 'CLOSE_WINDOW_START', id })
    setTimeout(() => dispatch({ type: 'CLOSE_WINDOW', id }), 150)
  }, [])
  const minimizeWindow = useCallback((id) => dispatch({ type: 'MINIMIZE_WINDOW', id }), [])
  const maximizeWindow = useCallback((id) => dispatch({ type: 'MAXIMIZE_WINDOW', id }), [])
  const restoreWindow = useCallback((id) => dispatch({ type: 'RESTORE_WINDOW', id }), [])
  const focusWindow = useCallback((id) => dispatch({ type: 'FOCUS_WINDOW', id }), [])
  const updatePosition = useCallback((id, x, y) => dispatch({ type: 'UPDATE_POSITION', id, x, y }), [])
  const updateSize = useCallback((id, width, height) => dispatch({ type: 'UPDATE_SIZE', id, width, height }), [])
  const updateWindowTitle = useCallback((id, title) => dispatch({ type: 'UPDATE_TITLE', id, title }), [])

  const value = {
    windows: state.windows,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updatePosition,
    updateSize,
    updateWindowTitle,
  }

  return (
    <WindowManagerContext.Provider value={value}>
      {children}
    </WindowManagerContext.Provider>
  )
}

export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (!context) throw new Error('useWindowManager must be used within WindowManagerProvider')
  return context
}

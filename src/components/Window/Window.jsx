import { useRef, useCallback, useEffect, useState } from 'react'
import Draggable from 'react-draggable'
import { useWindowManager } from '../../context/WindowManagerContext'
import './Window.css'

export default function Window({ windowData, children }) {
  const {
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusWindow,
    updatePosition,
    updateSize,
  } = useWindowManager()

  const nodeRef = useRef(null)
  const resizeRef = useRef(null)
  const [isResizing, setIsResizing] = useState(false)

  const { id, title, position, size, minimized, maximized, zIndex } = windowData

  const handleMouseDown = useCallback(() => {
    focusWindow(id)
  }, [focusWindow, id])

  const handleDragStop = useCallback((_e, data) => {
    updatePosition(id, data.x, data.y)
  }, [updatePosition, id])

  const handleMaximizeToggle = useCallback(() => {
    if (maximized) {
      restoreWindow(id)
    } else {
      maximizeWindow(id)
    }
  }, [maximized, maximizeWindow, restoreWindow, id])

  const handleTitleBarDoubleClick = useCallback(() => {
    handleMaximizeToggle()
  }, [handleMaximizeToggle])

  useEffect(() => {
    if (!isResizing) return

    function onMouseMove(e) {
      if (!nodeRef.current) return
      const rect = nodeRef.current.getBoundingClientRect()
      const newWidth = Math.max(280, e.clientX - rect.left)
      const newHeight = Math.max(200, e.clientY - rect.top)
      updateSize(id, newWidth, newHeight)
    }

    function onMouseUp() {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
  }, [isResizing, id, updateSize])

  const style = maximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: `calc(100vh - var(--taskbar-height))`,
        zIndex,
      }
    : {
        width: size.width,
        height: size.height,
        zIndex,
        ...(minimized ? { display: 'none' } : {}),
      }

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".window__title-bar"
      position={maximized ? { x: 0, y: 0 } : position}
      onStop={handleDragStop}
      bounds="parent"
      disabled={maximized || minimized}
    >
      <div
        ref={nodeRef}
        className={`window ${maximized ? 'window--maximized' : ''}`}
        style={style}
        onMouseDown={handleMouseDown}
      >
        <div className="window__title-bar" onDoubleClick={handleTitleBarDoubleClick}>
          <div className="window__title-icon" />
          <span className="window__title-text">{title}</span>
          <div className="window__title-buttons">
            <button
              className="window__btn window__btn--minimize"
              onClick={(e) => { e.stopPropagation(); minimizeWindow(id) }}
            >
              <span className="window__btn-icon">_</span>
            </button>
            <button
              className="window__btn window__btn--maximize"
              onClick={(e) => { e.stopPropagation(); handleMaximizeToggle() }}
            >
              <span className="window__btn-icon">{maximized ? '❐' : '□'}</span>
            </button>
            <button
              className="window__btn window__btn--close"
              onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
            >
              <span className="window__btn-icon">✕</span>
            </button>
          </div>
        </div>
        <div className="window__body">
          {children}
        </div>
        {!maximized && (
          <div
            className="window__resize-handle"
            onMouseDown={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setIsResizing(true)
            }}
          />
        )}
      </div>
    </Draggable>
  )
}

import { useEffect, useRef } from 'react'
import { useContextMenu } from '../../context/ContextMenuContext'
import './ContextMenu.css'

export default function ContextMenu() {
  const { menu, hideContextMenu } = useContextMenu()
  const ref = useRef(null)

  useEffect(() => {
    if (!menu) return

    function handleClick() {
      hideContextMenu()
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') hideContextMenu()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menu, hideContextMenu])

  useEffect(() => {
    if (!menu || !ref.current) return
    const el = ref.current
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    if (rect.right > vw) el.style.left = `${vw - rect.width - 4}px`
    if (rect.bottom > vh) el.style.top = `${vh - rect.height - 4}px`
  }, [menu])

  if (!menu) return null

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ left: menu.x, top: menu.y }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {menu.items.map((item, i) => {
        if (item.type === 'divider') {
          return <div key={i} className="context-menu__divider" />
        }
        return (
          <button
            key={i}
            className="context-menu__item"
            disabled={item.disabled}
            onClick={() => {
              item.action?.()
              hideContextMenu()
            }}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

import { useRef, useEffect } from 'react'
import starfield from './animations/starfield'
import matrixRain from './animations/matrixRain'
import bouncingLogo from './animations/bouncingLogo'
import './ScreenSaver.css'

const ANIMATIONS = {
  starfield,
  matrix: matrixRain,
  bouncing: bouncingLogo,
}

export default function ScreenSaver({ type, onDismiss }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')

    const animFn = ANIMATIONS[type] || ANIMATIONS.starfield
    const cleanup = animFn(ctx, canvas.width, canvas.height)

    function handleResize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    window.addEventListener('resize', handleResize)

    return () => {
      if (cleanup) cleanup()
      window.removeEventListener('resize', handleResize)
    }
  }, [type])

  return (
    <div
      className="screensaver"
      onMouseMove={onDismiss}
      onMouseDown={onDismiss}
      onKeyDown={onDismiss}
      onTouchStart={onDismiss}
      tabIndex={0}
    >
      <canvas ref={canvasRef} className="screensaver__canvas" />
    </div>
  )
}

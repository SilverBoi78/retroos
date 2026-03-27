import { useRef, useEffect, useCallback } from 'react'

export default function useGameLoop(callback, isRunning) {
  const callbackRef = useRef(callback)
  const rafRef = useRef(null)
  const lastTimeRef = useRef(null)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    if (!isRunning) {
      lastTimeRef.current = null
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
      return
    }

    function loop(timestamp) {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp
      }
      const delta = (timestamp - lastTimeRef.current) / 1000
      lastTimeRef.current = timestamp
      callbackRef.current(delta)
      rafRef.current = requestAnimationFrame(loop)
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [isRunning])
}

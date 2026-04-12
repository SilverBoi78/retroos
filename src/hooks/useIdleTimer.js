import { useState, useEffect, useRef, useCallback } from 'react'

const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll']

export default function useIdleTimer(timeoutMinutes, enabled) {
  const [isIdle, setIsIdle] = useState(false)
  const timerRef = useRef(null)

  const startTimer = useCallback(() => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setIsIdle(true)
    }, timeoutMinutes * 60 * 1000)
  }, [timeoutMinutes])

  const resetTimer = useCallback(() => {
    setIsIdle(false)
    startTimer()
  }, [startTimer])

  const dismiss = useCallback(() => {
    setIsIdle(false)
    startTimer()
  }, [startTimer])

  useEffect(() => {
    if (!enabled) {
      clearTimeout(timerRef.current)
      return
    }

    startTimer()
    EVENTS.forEach(e => document.addEventListener(e, resetTimer, { passive: true }))

    return () => {
      clearTimeout(timerRef.current)
      EVENTS.forEach(e => document.removeEventListener(e, resetTimer))
    }
  }, [enabled, startTimer, resetTimer])

  return { isIdle: enabled && isIdle, dismiss }
}

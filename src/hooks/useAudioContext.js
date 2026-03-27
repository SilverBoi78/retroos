import { useRef, useCallback, useEffect } from 'react'

let sharedContext = null
let contextRefCount = 0

function getSharedContext() {
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return sharedContext
}

export default function useAudioContext() {
  const ctxRef = useRef(null)

  useEffect(() => {
    ctxRef.current = getSharedContext()
    contextRefCount++
    return () => {
      contextRefCount--
    }
  }, [])

  const resume = useCallback(async () => {
    const ctx = ctxRef.current || getSharedContext()
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
    return ctx
  }, [])

  return {
    get audioCtx() {
      return ctxRef.current || getSharedContext()
    },
    resume,
  }
}

import { useRef, useCallback, useEffect } from 'react'
import useAudioContext from '../../hooks/useAudioContext'

export default function useRadioPlayer() {
  const { audioCtx, resume } = useAudioContext()
  const nodesRef = useRef(null)

  const stop = useCallback(() => {
    if (nodesRef.current) {
      try {
        nodesRef.current.gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.1)
        setTimeout(() => {
          try { nodesRef.current.osc.stop() } catch {}
          nodesRef.current = null
        }, 150)
      } catch {
        nodesRef.current = null
      }
    }
  }, [audioCtx])

  const play = useCallback(async (station, volume) => {
    await resume()
    stop()

    const ctx = audioCtx

    // Wait for previous to clean up
    await new Promise(r => setTimeout(r, 200))

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = station.waveform || 'sine'
    osc.frequency.setValueAtTime(station.frequency || 220, ctx.currentTime)

    // Add slight modulation for interest
    const lfo = ctx.createOscillator()
    const lfoGain = ctx.createGain()
    lfo.frequency.setValueAtTime(0.3, ctx.currentTime)
    lfoGain.gain.setValueAtTime(station.frequency * 0.02, ctx.currentTime)
    lfo.connect(lfoGain)
    lfoGain.connect(osc.frequency)
    lfo.start()

    gain.gain.setValueAtTime(0, ctx.currentTime)
    gain.gain.linearRampToValueAtTime(volume * 0.15, ctx.currentTime + 0.3)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()

    nodesRef.current = { osc, gain, lfo }
  }, [audioCtx, resume, stop])

  const setVolume = useCallback((volume) => {
    if (nodesRef.current?.gain) {
      nodesRef.current.gain.gain.linearRampToValueAtTime(volume * 0.15, audioCtx.currentTime + 0.05)
    }
  }, [audioCtx])

  useEffect(() => {
    return () => {
      if (nodesRef.current) {
        try { nodesRef.current.osc.stop() } catch {}
        try { nodesRef.current.lfo.stop() } catch {}
        nodesRef.current = null
      }
    }
  }, [])

  return { play, stop, setVolume }
}

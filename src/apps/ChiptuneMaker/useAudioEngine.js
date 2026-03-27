import { useRef, useCallback } from 'react'
import useAudioContext from '../../hooks/useAudioContext'
import frequencies from './noteFrequencies'

export default function useAudioEngine() {
  const { audioCtx, resume } = useAudioContext()
  const scheduledRef = useRef([])
  const timerRef = useRef(null)
  const positionRef = useRef(0)

  const stopAll = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    for (const osc of scheduledRef.current) {
      try { osc.stop() } catch {}
    }
    scheduledRef.current = []
    positionRef.current = 0
  }, [])

  const playNote = useCallback((noteName, waveform, startTime, duration, volume = 0.4) => {
    const ctx = audioCtx
    const freq = frequencies[noteName]
    if (!freq) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = waveform
    osc.frequency.setValueAtTime(freq, startTime)

    gain.gain.setValueAtTime(0, startTime)
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.01)
    gain.gain.linearRampToValueAtTime(volume * 0.5, startTime + 0.04)
    gain.gain.setValueAtTime(volume * 0.5, startTime + duration * 0.8)
    gain.gain.linearRampToValueAtTime(0, startTime + duration)

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(startTime)
    osc.stop(startTime + duration)

    scheduledRef.current.push(osc)
    osc.onended = () => {
      scheduledRef.current = scheduledRef.current.filter(o => o !== osc)
    }
  }, [audioCtx])

  const playSong = useCallback(async (tracks, bpm, steps, loop, onStep) => {
    await resume()
    stopAll()

    const ctx = audioCtx
    const stepDuration = 60 / bpm / 2
    let currentStep = 0

    function scheduleStep() {
      if (currentStep >= steps) {
        if (loop) {
          currentStep = 0
        } else {
          stopAll()
          onStep(-1)
          return
        }
      }

      const time = ctx.currentTime + 0.05

      for (const track of tracks) {
        const note = track.notes[currentStep]
        if (note) {
          playNote(note, track.waveform, time, stepDuration * 0.9, track.volume)
        }
      }

      onStep(currentStep)
      currentStep++
      positionRef.current = currentStep
    }

    scheduleStep()
    timerRef.current = setInterval(scheduleStep, stepDuration * 1000)
  }, [audioCtx, resume, stopAll, playNote])

  return { playSong, stopAll, playNote: async (note, wave) => {
    await resume()
    playNote(note, wave, audioCtx.currentTime, 0.3)
  }}
}

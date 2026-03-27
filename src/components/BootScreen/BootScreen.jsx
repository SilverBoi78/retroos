import { useState, useEffect } from 'react'
import './BootScreen.css'

const POST_LINES = [
  'RetroOS BIOS v2.4.1',
  'Copyright (C) 2024-2026 RetroOS Project',
  '',
  'Checking memory... 640K OK',
  'Detecting devices...',
  '  Display: VGA 1024x768',
  '  Storage: Virtual FS 256MB',
  '  Audio: Web Audio API',
  '',
  'Loading RetroOS kernel...',
  'Mounting filesystem...',
  'Starting services...',
]

export default function BootScreen({ onComplete }) {
  const [phase, setPhase] = useState('post') // post | logo | fade
  const [visibleLines, setVisibleLines] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (phase !== 'post') return
    if (visibleLines < POST_LINES.length) {
      const timer = setTimeout(() => setVisibleLines(v => v + 1), 120)
      return () => clearTimeout(timer)
    }
    const timer = setTimeout(() => setPhase('logo'), 300)
    return () => clearTimeout(timer)
  }, [phase, visibleLines])

  useEffect(() => {
    if (phase !== 'logo') return
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 5
      })
    }, 50)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => setPhase('fade'), 400)
      return () => clearTimeout(timer)
    }
  }, [progress])

  useEffect(() => {
    if (phase === 'fade') {
      const timer = setTimeout(onComplete, 500)
      return () => clearTimeout(timer)
    }
  }, [phase, onComplete])

  return (
    <div className={`boot-screen${phase === 'fade' ? ' boot-screen--fading' : ''}`}>
      {phase === 'post' && (
        <div className="boot-post">
          {POST_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="boot-post__line">
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      )}

      <div className={`boot-logo${phase !== 'post' ? ' boot-logo--visible' : ''}`}>
        <div className="boot-logo__title">RetroOS</div>
        <div className="boot-logo__version">v0.9 BETA</div>
        <div className="boot-progress">
          <div className="boot-progress__bar">
            <div className="boot-progress__fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="boot-progress__text">Loading desktop environment...</div>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useSettings } from '../../context/SettingsContext'

export default function TaskbarClock() {
  const { settings } = useSettings()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hour12 = settings.clockFormat === '12h'
  const timeStr = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  })
  const dateStr = time.toLocaleDateString([], { month: 'short', day: 'numeric' })

  return (
    <div className="taskbar__clock">
      <span className="taskbar__clock-time">{timeStr}</span>
      <span className="taskbar__clock-date">{dateStr}</span>
    </div>
  )
}

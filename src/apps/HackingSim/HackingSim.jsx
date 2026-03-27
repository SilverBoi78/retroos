import { useState, useCallback, useEffect } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import { useNotification } from '../../context/NotificationContext'
import LevelSelect from './LevelSelect'
import HackingTerminal from './HackingTerminal'
import levels from './levels/index'
import './HackingSim.css'

const SAVE_PATH = '/Games/HackingSim.json'

export default function HackingSim() {
  const { readFile, writeFile } = useFileSystem()
  const { notify } = useNotification()
  const [screen, setScreen] = useState('levels')
  const [currentLevelId, setCurrentLevelId] = useState(null)
  const [unlockedLevel, setUnlockedLevel] = useState(1)
  const [completedLevels, setCompletedLevels] = useState([])

  useEffect(() => {
    const raw = readFile(SAVE_PATH)
    if (raw) {
      try {
        const data = JSON.parse(raw)
        setUnlockedLevel(data.unlockedLevel || 1)
        setCompletedLevels(data.completedLevels || [])
      } catch {}
    }
  }, [readFile])

  const saveProgress = useCallback((unlocked, completed) => {
    writeFile(SAVE_PATH, JSON.stringify({ unlockedLevel: unlocked, completedLevels: completed }))
  }, [writeFile])

  const handleSelectLevel = useCallback((levelId) => {
    setCurrentLevelId(levelId)
    setScreen('playing')
  }, [])

  const handleSolved = useCallback((levelId) => {
    setCompletedLevels(prev => {
      const next = prev.includes(levelId) ? prev : [...prev, levelId]
      const nextUnlocked = Math.max(unlockedLevel, levelId + 1)
      setUnlockedLevel(nextUnlocked)
      saveProgress(nextUnlocked, next)
      return next
    })
    notify('Level complete! Access granted.', { type: 'success' })
    setTimeout(() => setScreen('levels'), 500)
  }, [unlockedLevel, saveProgress, notify])

  const handleBack = useCallback(() => {
    setScreen('levels')
    setCurrentLevelId(null)
  }, [])

  if (screen === 'playing' && currentLevelId) {
    const level = levels.find(l => l.id === currentLevelId)
    if (!level) { setScreen('levels'); return null }

    return (
      <div className="hackingsim">
        <HackingTerminal
          level={level}
          onSolved={handleSolved}
          onBack={handleBack}
        />
      </div>
    )
  }

  return (
    <div className="hackingsim">
      <LevelSelect
        unlockedLevel={unlockedLevel}
        completedLevels={completedLevels}
        onSelectLevel={handleSelectLevel}
      />
    </div>
  )
}

import { useState, useCallback, useEffect } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'

const SCORES_PATH = '/Games/ArcadeHighScores.json'
const MAX_SCORES = 5

export default function useHighScores() {
  const { readFile, writeFile, exists } = useFileSystem()
  const [scores, setScores] = useState({})

  useEffect(() => {
    const raw = readFile(SCORES_PATH)
    if (raw) {
      try { setScores(JSON.parse(raw)) } catch {}
    }
  }, [readFile])

  const addScore = useCallback((gameId, score) => {
    setScores(prev => {
      const gameScores = prev[gameId] || []
      const updated = [...gameScores, score].sort((a, b) => b - a).slice(0, MAX_SCORES)
      const next = { ...prev, [gameId]: updated }
      writeFile(SCORES_PATH, JSON.stringify(next, null, 2))
      return next
    })
  }, [writeFile])

  const getScores = useCallback((gameId) => {
    return scores[gameId] || []
  }, [scores])

  return { scores, addScore, getScores }
}

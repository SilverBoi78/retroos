import { useState, useCallback } from 'react'
import { useNotification } from '../../context/NotificationContext'
import GameMenu from './GameMenu'
import Breakout from './games/Breakout'
import SpaceShooter from './games/SpaceShooter'
import Pong from './games/Pong'
import Runner from './games/Runner'
import useHighScores from './useHighScores'
import './ArcadeCabinet.css'

const gameComponents = {
  breakout: Breakout,
  shooter: SpaceShooter,
  pong: Pong,
  runner: Runner,
}

export default function ArcadeCabinet() {
  const [currentGame, setCurrentGame] = useState(null)
  const { addScore, getScores } = useHighScores()
  const { notify } = useNotification()

  const handleBack = useCallback(() => {
    setCurrentGame(null)
  }, [])

  const handleGameOver = useCallback((score) => {
    if (currentGame && score > 0) {
      addScore(currentGame, score)
      notify(`Game Over! Score: ${score}`, { type: 'info' })
    }
  }, [currentGame, addScore, notify])

  if (!currentGame) {
    return (
      <div className="arcade-cabinet">
        <GameMenu onSelectGame={setCurrentGame} getScores={getScores} />
      </div>
    )
  }

  const GameComponent = gameComponents[currentGame]
  if (!GameComponent) {
    setCurrentGame(null)
    return null
  }

  return (
    <div className="arcade-cabinet">
      <GameComponent
        onGameOver={handleGameOver}
        onBack={handleBack}
        canvasWidth={440}
        canvasHeight={400}
      />
    </div>
  )
}

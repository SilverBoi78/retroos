import { useState, useEffect, useRef } from 'react'
import useMinesweeper, { DIFFICULTIES } from './useMinesweeper'
import { useNotification } from '../../context/NotificationContext'
import './Minesweeper.css'

const NUMBER_COLORS = [
  null, '#0000ff', '#008000', '#ff0000', '#000080',
  '#800000', '#008080', '#000000', '#808080',
]

export default function Minesweeper() {
  const {
    grid, gameState, timer, difficulty,
    minesRemaining, newGame, revealCell, toggleFlag,
  } = useMinesweeper()
  const { notify } = useNotification()
  const [menuOpen, setMenuOpen] = useState(false)
  const prevGameState = useRef(gameState)

  useEffect(() => {
    if (prevGameState.current === gameState) return
    prevGameState.current = gameState
    if (gameState === 'won') notify(`You won in ${timer}s!`, { type: 'success' })
    else if (gameState === 'lost') notify('Game over!', { type: 'error' })
  }, [gameState, timer, notify])

  function handleCellClick(row, col) {
    revealCell(row, col)
  }

  function handleCellRightClick(e, row, col) {
    e.preventDefault()
    toggleFlag(row, col)
  }

  function getSmiley() {
    if (gameState === 'won') return '😎'
    if (gameState === 'lost') return '😵'
    return '🙂'
  }

  function getCellContent(cell) {
    if (cell.isFlagged) return '🚩'
    if (!cell.isRevealed) return ''
    if (cell.isMine) return '💣'
    if (cell.adjacentMines === 0) return ''
    return cell.adjacentMines
  }

  function formatNumber(n) {
    const s = Math.max(-99, Math.min(999, n)).toString()
    return s.padStart(3, '0')
  }

  return (
    <div className="minesweeper">
      <div className="minesweeper__menu-bar">
        <button
          className="minesweeper__menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          Game
        </button>
        {menuOpen && (
          <div className="minesweeper__menu-dropdown">
            <button onClick={() => { newGame(difficulty); setMenuOpen(false) }}>New Game</button>
            <div className="minesweeper__menu-divider" />
            {Object.keys(DIFFICULTIES).map(d => (
              <button
                key={d}
                onClick={() => { newGame(d); setMenuOpen(false) }}
                className={d === difficulty ? 'active' : ''}
              >
                {d === difficulty ? '✓ ' : '  '}{d.charAt(0).toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="minesweeper__status-bar">
        <div className="minesweeper__counter">{formatNumber(minesRemaining)}</div>
        <button
          className="minesweeper__smiley"
          onClick={() => newGame(difficulty)}
        >
          {getSmiley()}
        </button>
        <div className="minesweeper__counter">{formatNumber(timer)}</div>
      </div>

      <div className="minesweeper__grid-container">
        <div
          className="minesweeper__grid"
          style={{
            gridTemplateColumns: `repeat(${grid[0]?.length || 9}, 20px)`,
            gridTemplateRows: `repeat(${grid.length || 9}, 20px)`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => (
              <button
                key={`${r}-${c}`}
                className={`minesweeper__cell${cell.isRevealed ? ' revealed' : ''}${cell.exploded ? ' exploded' : ''}`}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleCellRightClick(e, r, c)}
                style={
                  cell.isRevealed && cell.adjacentMines > 0 && !cell.isMine
                    ? { color: NUMBER_COLORS[cell.adjacentMines] }
                    : undefined
                }
              >
                {getCellContent(cell)}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useCallback, useEffect } from 'react'

const DIFFICULTIES = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 16, cols: 16, mines: 40 },
  expert: { rows: 16, cols: 30, mines: 99 },
}

function createEmptyGrid(rows, cols) {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      isMine: false,
      isRevealed: false,
      isFlagged: false,
      adjacentMines: 0,
    }))
  )
}

function placeMines(grid, mines, safeRow, safeCol) {
  const rows = grid.length
  const cols = grid[0].length
  let placed = 0

  while (placed < mines) {
    const r = Math.floor(Math.random() * rows)
    const c = Math.floor(Math.random() * cols)

    if (grid[r][c].isMine) continue
    if (Math.abs(r - safeRow) <= 1 && Math.abs(c - safeCol) <= 1) continue

    grid[r][c].isMine = true
    placed++
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c].isMine) continue
      let count = 0
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr
          const nc = c + dc
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
            count++
          }
        }
      }
      grid[r][c].adjacentMines = count
    }
  }
}

function floodReveal(grid, row, col) {
  const rows = grid.length
  const cols = grid[0].length
  const stack = [[row, col]]

  while (stack.length > 0) {
    const [r, c] = stack.pop()
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue
    if (grid[r][c].isRevealed || grid[r][c].isFlagged) continue

    grid[r][c].isRevealed = true

    if (grid[r][c].adjacentMines === 0 && !grid[r][c].isMine) {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue
          stack.push([r + dr, c + dc])
        }
      }
    }
  }
}

function checkWin(grid) {
  for (const row of grid) {
    for (const cell of row) {
      if (!cell.isMine && !cell.isRevealed) return false
    }
  }
  return true
}

export default function useMinesweeper() {
  const [difficulty, setDifficulty] = useState('beginner')
  const [grid, setGrid] = useState(() => createEmptyGrid(9, 9))
  const [gameState, setGameState] = useState('idle')
  const [timer, setTimer] = useState(0)
  const [flagCount, setFlagCount] = useState(0)
  const timerRef = useRef(null)
  const isFirstClick = useRef(true)

  const config = DIFFICULTIES[difficulty]

  function startTimer() {
    if (timerRef.current) return
    timerRef.current = setInterval(() => {
      setTimer(t => t + 1)
    }, 1000)
  }

  function stopTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    return () => stopTimer()
  }, [])

  const newGame = useCallback((diff) => {
    const d = diff || difficulty
    setDifficulty(d)
    const cfg = DIFFICULTIES[d]
    setGrid(createEmptyGrid(cfg.rows, cfg.cols))
    setGameState('idle')
    setTimer(0)
    setFlagCount(0)
    isFirstClick.current = true
    stopTimer()
  }, [difficulty])

  const revealCell = useCallback((row, col) => {
    if (gameState === 'won' || gameState === 'lost') return

    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })))
      const cell = next[row][col]

      if (cell.isRevealed || cell.isFlagged) return prev

      if (isFirstClick.current) {
        isFirstClick.current = false
        placeMines(next, config.mines, row, col)
        startTimer()
        setGameState('playing')
      }

      if (next[row][col].isMine) {
        // Reveal all mines
        for (const r of next) {
          for (const c of r) {
            if (c.isMine) c.isRevealed = true
          }
        }
        next[row][col].exploded = true
        stopTimer()
        setGameState('lost')
        return next
      }

      floodReveal(next, row, col)

      if (checkWin(next)) {
        stopTimer()
        setGameState('won')
      }

      return next
    })
  }, [gameState, config.mines])

  const toggleFlag = useCallback((row, col) => {
    if (gameState === 'won' || gameState === 'lost') return

    setGrid(prev => {
      const next = prev.map(r => r.map(c => ({ ...c })))
      const cell = next[row][col]
      if (cell.isRevealed) return prev

      cell.isFlagged = !cell.isFlagged
      setFlagCount(f => cell.isFlagged ? f + 1 : f - 1)
      return next
    })
  }, [gameState])

  return {
    grid,
    gameState,
    timer,
    difficulty,
    minesRemaining: config.mines - flagCount,
    config,
    newGame,
    revealCell,
    toggleFlag,
  }
}

export { DIFFICULTIES }

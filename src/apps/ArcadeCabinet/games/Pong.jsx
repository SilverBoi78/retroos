import { useRef, useEffect, useCallback } from 'react'
import useGameLoop from '../../../hooks/useGameLoop'

const PADDLE_W = 10
const PADDLE_H = 50
const BALL_SIZE = 8
const WIN_SCORE = 7

export default function Pong({ onGameOver, onBack, canvasWidth, canvasHeight }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const keysRef = useRef({})

  const w = canvasWidth || 400
  const h = canvasHeight || 380

  const initGame = useCallback(() => {
    stateRef.current = {
      player: { y: h / 2 - PADDLE_H / 2 },
      ai: { y: h / 2 - PADDLE_H / 2 },
      ball: { x: w / 2, y: h / 2, dx: 3, dy: 2 },
      playerScore: 0,
      aiScore: 0,
      gameOver: false,
      paused: true,
    }
  }, [w, h])

  useEffect(() => { initGame() }, [initGame])

  useEffect(() => {
    function down(e) { keysRef.current[e.key] = true }
    function up(e) { keysRef.current[e.key] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const update = useCallback((dt) => {
    const s = stateRef.current
    if (!s || s.gameOver) return

    if (s.paused) {
      if (keysRef.current[' ']) s.paused = false
      draw()
      return
    }

    const speed = 250 * dt
    if (keysRef.current['ArrowUp'] || keysRef.current['w']) s.player.y = Math.max(0, s.player.y - speed)
    if (keysRef.current['ArrowDown'] || keysRef.current['s']) s.player.y = Math.min(h - PADDLE_H, s.player.y + speed)

    // AI
    const aiCenter = s.ai.y + PADDLE_H / 2
    const aiSpeed = 180 * dt
    if (s.ball.dx > 0) {
      if (aiCenter < s.ball.y - 10) s.ai.y += aiSpeed
      else if (aiCenter > s.ball.y + 10) s.ai.y -= aiSpeed
    }
    s.ai.y = Math.max(0, Math.min(h - PADDLE_H, s.ai.y))

    // Ball
    s.ball.x += s.ball.dx
    s.ball.y += s.ball.dy

    if (s.ball.y <= 0 || s.ball.y >= h - BALL_SIZE) s.ball.dy *= -1

    // Player paddle
    if (s.ball.dx < 0 &&
        s.ball.x <= 20 + PADDLE_W &&
        s.ball.x >= 20 &&
        s.ball.y + BALL_SIZE >= s.player.y &&
        s.ball.y <= s.player.y + PADDLE_H) {
      s.ball.dx *= -1.05
      const hit = ((s.ball.y + BALL_SIZE / 2) - s.player.y) / PADDLE_H
      s.ball.dy = 4 * (hit - 0.5)
    }

    // AI paddle
    if (s.ball.dx > 0 &&
        s.ball.x + BALL_SIZE >= w - 20 - PADDLE_W &&
        s.ball.x + BALL_SIZE <= w - 20 &&
        s.ball.y + BALL_SIZE >= s.ai.y &&
        s.ball.y <= s.ai.y + PADDLE_H) {
      s.ball.dx *= -1.05
      const hit = ((s.ball.y + BALL_SIZE / 2) - s.ai.y) / PADDLE_H
      s.ball.dy = 4 * (hit - 0.5)
    }

    // Score
    if (s.ball.x < 0) {
      s.aiScore++
      if (s.aiScore >= WIN_SCORE) { s.gameOver = true; onGameOver(s.playerScore * 100); return }
      resetBall(s)
    }
    if (s.ball.x > w) {
      s.playerScore++
      if (s.playerScore >= WIN_SCORE) { s.gameOver = true; onGameOver(s.playerScore * 100); return }
      resetBall(s)
    }

    draw()
  }, [w, h, onGameOver])

  function resetBall(s) {
    s.ball.x = w / 2
    s.ball.y = h / 2
    s.ball.dx = (Math.random() > 0.5 ? 3 : -3)
    s.ball.dy = (Math.random() - 0.5) * 4
    s.paused = true
  }

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const s = stateRef.current
    if (!s) return

    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, w, h)

    // Center line
    ctx.setLineDash([4, 4])
    ctx.strokeStyle = '#333'
    ctx.beginPath()
    ctx.moveTo(w / 2, 0)
    ctx.lineTo(w / 2, h)
    ctx.stroke()
    ctx.setLineDash([])

    // Paddles
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(20, s.player.y, PADDLE_W, PADDLE_H)
    ctx.fillRect(w - 20 - PADDLE_W, s.ai.y, PADDLE_W, PADDLE_H)

    // Ball
    ctx.fillRect(s.ball.x, s.ball.y, BALL_SIZE, BALL_SIZE)

    // Scores
    ctx.font = '24px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(s.playerScore, w / 4, 30)
    ctx.fillText(s.aiScore, 3 * w / 4, 30)
    ctx.textAlign = 'left'

    if (s.paused && !s.gameOver) {
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Press SPACE to serve', w / 2, h / 2 + 40)
      ctx.textAlign = 'left'
    }

    if (s.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(s.playerScore >= WIN_SCORE ? 'YOU WIN!' : 'GAME OVER', w / 2, h / 2 - 10)
      ctx.font = '14px monospace'
      ctx.fillText(`${s.playerScore} - ${s.aiScore}`, w / 2, h / 2 + 15)
      ctx.textAlign = 'left'
    }
  }

  useGameLoop(update, true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <canvas ref={canvasRef} width={w} height={h} style={{ background: '#0a0a1a', display: 'block' }} />
      <button onClick={onBack} className="arcade-back-btn">Back to Menu</button>
    </div>
  )
}

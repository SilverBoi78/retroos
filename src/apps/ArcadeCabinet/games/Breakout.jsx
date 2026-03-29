import { useRef, useEffect, useCallback } from 'react'
import useGameLoop from '../../../hooks/useGameLoop'

const COLS = 10
const ROWS = 5
const BRICK_H = 14
const BRICK_PAD = 2
const PADDLE_H = 10
const PADDLE_W = 60
const BALL_R = 4
const BALL_SPEED = 4
const MAX_BOUNCE_ANGLE = Math.PI / 3
const LAUNCH_ANGLE = Math.PI / 6
const BRICK_COLORS = ['#ff4444', '#ff8844', '#ffcc44', '#44cc44', '#4488ff']

export default function Breakout({ onGameOver, onBack, canvasWidth, canvasHeight }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const keysRef = useRef({})

  const w = canvasWidth || 400
  const h = canvasHeight || 380

  const initGame = useCallback(() => {
    const brickW = (w - BRICK_PAD * (COLS + 1)) / COLS
    const bricks = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({
          x: BRICK_PAD + c * (brickW + BRICK_PAD),
          y: 30 + r * (BRICK_H + BRICK_PAD),
          w: brickW, h: BRICK_H,
          alive: true, color: BRICK_COLORS[r],
        })
      }
    }
    stateRef.current = {
      paddle: { x: w / 2 - PADDLE_W / 2, y: h - 30 },
      ball: { x: w / 2, y: h - 50, dx: BALL_SPEED * Math.sin(LAUNCH_ANGLE), dy: -BALL_SPEED * Math.cos(LAUNCH_ANGLE) },
      bricks, score: 0, lives: 3, started: false, gameOver: false,
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

    const speed = 300 * dt
    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) s.paddle.x = Math.max(0, s.paddle.x - speed)
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) s.paddle.x = Math.min(w - PADDLE_W, s.paddle.x + speed)

    if (!s.started) {
      s.ball.x = s.paddle.x + PADDLE_W / 2
      s.ball.y = s.paddle.y - BALL_R
      if (keysRef.current[' ']) s.started = true
      draw()
      return
    }

    const frameScale = dt * 60
    s.ball.x += s.ball.dx * frameScale
    s.ball.y += s.ball.dy * frameScale

    if (s.ball.x - BALL_R < 0 || s.ball.x + BALL_R > w) s.ball.dx *= -1
    if (s.ball.y - BALL_R < 0) s.ball.dy *= -1

    // Paddle collision
    if (s.ball.dy > 0 &&
        s.ball.y + BALL_R >= s.paddle.y &&
        s.ball.y + BALL_R <= s.paddle.y + PADDLE_H &&
        s.ball.x >= s.paddle.x &&
        s.ball.x <= s.paddle.x + PADDLE_W) {
      const hit = (s.ball.x - s.paddle.x) / PADDLE_W
      const angle = (hit - 0.5) * MAX_BOUNCE_ANGLE * 2
      s.ball.dx = BALL_SPEED * Math.sin(angle)
      s.ball.dy = -BALL_SPEED * Math.cos(angle)
    }

    // Ball out
    if (s.ball.y > h) {
      s.lives--
      if (s.lives <= 0) {
        s.gameOver = true
        onGameOver(s.score)
        return
      }
      s.started = false
      s.ball.dx = BALL_SPEED * Math.sin(LAUNCH_ANGLE)
      s.ball.dy = -BALL_SPEED * Math.cos(LAUNCH_ANGLE)
    }

    // Brick collision
    for (const brick of s.bricks) {
      if (!brick.alive) continue
      if (s.ball.x + BALL_R > brick.x && s.ball.x - BALL_R < brick.x + brick.w &&
          s.ball.y + BALL_R > brick.y && s.ball.y - BALL_R < brick.y + brick.h) {
        brick.alive = false
        s.ball.dy *= -1
        s.score += 10
      }
    }

    if (s.bricks.every(b => !b.alive)) {
      s.gameOver = true
      onGameOver(s.score)
    }

    draw()
  }, [w, h, onGameOver])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const s = stateRef.current
    if (!s) return

    ctx.fillStyle = '#0a0a1a'
    ctx.fillRect(0, 0, w, h)

    // Bricks
    for (const b of s.bricks) {
      if (!b.alive) continue
      ctx.fillStyle = b.color
      ctx.fillRect(b.x, b.y, b.w, b.h)
    }

    // Paddle
    ctx.fillStyle = '#cccccc'
    ctx.fillRect(s.paddle.x, s.paddle.y, PADDLE_W, PADDLE_H)

    // Ball
    ctx.fillStyle = '#ffffff'
    ctx.beginPath()
    ctx.arc(s.ball.x, s.ball.y, BALL_R, 0, Math.PI * 2)
    ctx.fill()

    // HUD
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px monospace'
    ctx.fillText(`Score: ${s.score}`, 8, 16)
    ctx.fillText(`Lives: ${s.lives}`, w - 70, 16)

    if (!s.started) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Press SPACE to launch', w / 2, h / 2)
      ctx.textAlign = 'left'
    }

    if (s.gameOver) {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, w, h)
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', w / 2, h / 2 - 10)
      ctx.font = '14px monospace'
      ctx.fillText(`Score: ${s.score}`, w / 2, h / 2 + 15)
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

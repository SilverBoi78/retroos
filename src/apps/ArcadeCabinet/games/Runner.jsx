import { useRef, useEffect, useCallback } from 'react'
import useGameLoop from '../../../hooks/useGameLoop'

const GROUND_Y_OFFSET = 40
const PLAYER_W = 20
const PLAYER_H = 30
const GRAVITY = 1200
const JUMP_VEL = -450

export default function Runner({ onGameOver, onBack, canvasWidth, canvasHeight }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const keysRef = useRef({})

  const w = canvasWidth || 400
  const h = canvasHeight || 380
  const groundY = h - GROUND_Y_OFFSET

  const initGame = useCallback(() => {
    stateRef.current = {
      player: { x: 60, y: groundY - PLAYER_H, vy: 0, grounded: true },
      obstacles: [],
      score: 0,
      speed: 200,
      spawnTimer: 1.5,
      gameOver: false,
      started: false,
    }
  }, [groundY])

  useEffect(() => { initGame() }, [initGame])

  useEffect(() => {
    function down(e) {
      keysRef.current[e.key] = true
      if ((e.key === ' ' || e.key === 'ArrowUp') && stateRef.current && !stateRef.current.started) {
        stateRef.current.started = true
      }
    }
    function up(e) { keysRef.current[e.key] = false }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up) }
  }, [])

  const update = useCallback((dt) => {
    const s = stateRef.current
    if (!s || s.gameOver) return

    if (!s.started) { draw(); return }

    // Jump
    if ((keysRef.current[' '] || keysRef.current['ArrowUp']) && s.player.grounded) {
      s.player.vy = JUMP_VEL
      s.player.grounded = false
    }

    // Physics
    s.player.vy += GRAVITY * dt
    s.player.y += s.player.vy * dt
    if (s.player.y >= groundY - PLAYER_H) {
      s.player.y = groundY - PLAYER_H
      s.player.vy = 0
      s.player.grounded = true
    }

    // Spawn obstacles
    s.spawnTimer -= dt
    if (s.spawnTimer <= 0) {
      const obstH = 20 + Math.random() * 20
      s.obstacles.push({
        x: w + 10,
        y: groundY - obstH,
        w: 15 + Math.random() * 10,
        h: obstH,
      })
      s.spawnTimer = 0.8 + Math.random() * 1.2
    }

    // Move obstacles
    for (const o of s.obstacles) o.x -= s.speed * dt
    s.obstacles = s.obstacles.filter(o => o.x + o.w > -10)

    // Collision
    for (const o of s.obstacles) {
      if (s.player.x + PLAYER_W > o.x + 3 && s.player.x < o.x + o.w - 3 &&
          s.player.y + PLAYER_H > o.y + 3) {
        s.gameOver = true
        onGameOver(Math.floor(s.score))
        return
      }
    }

    s.score += dt * 10
    s.speed = 200 + s.score * 0.5

    draw()
  }, [w, h, groundY, onGameOver])

  function draw() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const s = stateRef.current
    if (!s) return

    ctx.fillStyle = '#1a1a2a'
    ctx.fillRect(0, 0, w, h)

    // Ground
    ctx.fillStyle = '#333344'
    ctx.fillRect(0, groundY, w, GROUND_Y_OFFSET)
    ctx.strokeStyle = '#555566'
    ctx.beginPath()
    ctx.moveTo(0, groundY)
    ctx.lineTo(w, groundY)
    ctx.stroke()

    // Player
    ctx.fillStyle = '#44ccff'
    ctx.fillRect(s.player.x, s.player.y, PLAYER_W, PLAYER_H)

    // Obstacles
    ctx.fillStyle = '#ff6644'
    for (const o of s.obstacles) ctx.fillRect(o.x, o.y, o.w, o.h)

    // Score
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px monospace'
    ctx.fillText(`Score: ${Math.floor(s.score)}`, 8, 16)

    if (!s.started) {
      ctx.fillStyle = 'rgba(255,255,255,0.7)'
      ctx.font = '14px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('Press SPACE or UP to start', w / 2, h / 2)
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
      ctx.fillText(`Score: ${Math.floor(s.score)}`, w / 2, h / 2 + 15)
      ctx.textAlign = 'left'
    }
  }

  useGameLoop(update, true)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <canvas ref={canvasRef} width={w} height={h} style={{ background: '#1a1a2a', display: 'block' }} />
      <button onClick={onBack} className="arcade-back-btn">Back to Menu</button>
    </div>
  )
}

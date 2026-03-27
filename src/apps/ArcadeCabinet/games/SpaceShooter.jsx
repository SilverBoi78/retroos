import { useRef, useEffect, useCallback } from 'react'
import useGameLoop from '../../../hooks/useGameLoop'

const SHIP_W = 24
const SHIP_H = 20
const BULLET_W = 3
const BULLET_H = 8
const ENEMY_W = 20
const ENEMY_H = 16

export default function SpaceShooter({ onGameOver, onBack, canvasWidth, canvasHeight }) {
  const canvasRef = useRef(null)
  const stateRef = useRef(null)
  const keysRef = useRef({})

  const w = canvasWidth || 400
  const h = canvasHeight || 380

  const initGame = useCallback(() => {
    stateRef.current = {
      ship: { x: w / 2 - SHIP_W / 2, y: h - 40 },
      bullets: [],
      enemies: [],
      score: 0,
      gameOver: false,
      spawnTimer: 0,
      shootCooldown: 0,
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

    const speed = 250 * dt

    if (keysRef.current['ArrowLeft'] || keysRef.current['a']) s.ship.x = Math.max(0, s.ship.x - speed)
    if (keysRef.current['ArrowRight'] || keysRef.current['d']) s.ship.x = Math.min(w - SHIP_W, s.ship.x + speed)

    s.shootCooldown -= dt
    if (keysRef.current[' '] && s.shootCooldown <= 0) {
      s.bullets.push({ x: s.ship.x + SHIP_W / 2 - BULLET_W / 2, y: s.ship.y })
      s.shootCooldown = 0.2
    }

    // Move bullets
    for (const b of s.bullets) b.y -= 400 * dt
    s.bullets = s.bullets.filter(b => b.y > -BULLET_H)

    // Spawn enemies
    s.spawnTimer -= dt
    if (s.spawnTimer <= 0) {
      s.enemies.push({
        x: Math.random() * (w - ENEMY_W),
        y: -ENEMY_H,
        speed: 60 + Math.random() * 80,
      })
      s.spawnTimer = 0.8 + Math.random() * 0.6
    }

    // Move enemies
    for (const e of s.enemies) e.y += e.speed * dt

    // Check enemy hits bottom / ship
    for (const e of s.enemies) {
      if (e.y > h) {
        s.gameOver = true
        onGameOver(s.score)
        return
      }
      if (e.x < s.ship.x + SHIP_W && e.x + ENEMY_W > s.ship.x &&
          e.y < s.ship.y + SHIP_H && e.y + ENEMY_H > s.ship.y) {
        s.gameOver = true
        onGameOver(s.score)
        return
      }
    }

    // Bullet-enemy collision
    const deadEnemies = new Set()
    const deadBullets = new Set()
    for (let bi = 0; bi < s.bullets.length; bi++) {
      const b = s.bullets[bi]
      for (let ei = 0; ei < s.enemies.length; ei++) {
        const e = s.enemies[ei]
        if (deadEnemies.has(ei)) continue
        if (b.x < e.x + ENEMY_W && b.x + BULLET_W > e.x &&
            b.y < e.y + ENEMY_H && b.y + BULLET_H > e.y) {
          deadEnemies.add(ei)
          deadBullets.add(bi)
          s.score += 10
        }
      }
    }
    s.enemies = s.enemies.filter((_, i) => !deadEnemies.has(i))
    s.bullets = s.bullets.filter((_, i) => !deadBullets.has(i))

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

    // Ship
    ctx.fillStyle = '#44ccff'
    ctx.beginPath()
    ctx.moveTo(s.ship.x + SHIP_W / 2, s.ship.y)
    ctx.lineTo(s.ship.x, s.ship.y + SHIP_H)
    ctx.lineTo(s.ship.x + SHIP_W, s.ship.y + SHIP_H)
    ctx.closePath()
    ctx.fill()

    // Bullets
    ctx.fillStyle = '#ffff44'
    for (const b of s.bullets) ctx.fillRect(b.x, b.y, BULLET_W, BULLET_H)

    // Enemies
    ctx.fillStyle = '#ff4444'
    for (const e of s.enemies) {
      ctx.fillRect(e.x + 2, e.y, ENEMY_W - 4, ENEMY_H)
      ctx.fillRect(e.x, e.y + 4, ENEMY_W, ENEMY_H - 8)
    }

    // HUD
    ctx.fillStyle = '#ffffff'
    ctx.font = '12px monospace'
    ctx.fillText(`Score: ${s.score}`, 8, 16)

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

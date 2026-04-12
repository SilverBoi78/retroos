export default function matrixRain(ctx, width, height) {
  const FONT_SIZE = 14
  const columns = Math.floor(width / FONT_SIZE)
  const drops = new Array(columns).fill(0)
  const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFRETROS'

  let animId = null

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'
    ctx.fillRect(0, 0, width, height)

    ctx.font = `${FONT_SIZE}px monospace`

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)]
      const x = i * FONT_SIZE
      const y = drops[i] * FONT_SIZE

      // Head of the drop is bright white-green
      if (Math.random() > 0.5) {
        ctx.fillStyle = '#ffffff'
      } else {
        ctx.fillStyle = '#00ff41'
      }
      ctx.fillText(char, x, y)

      // Trailing glow
      ctx.fillStyle = '#00cc33'
      if (y > FONT_SIZE) {
        const trailChar = chars[Math.floor(Math.random() * chars.length)]
        ctx.fillText(trailChar, x, y - FONT_SIZE)
      }

      if (y > height && Math.random() > 0.975) {
        drops[i] = 0
      }
      drops[i]++
    }

    animId = requestAnimationFrame(draw)
  }

  // Initial black fill
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  draw()

  return () => cancelAnimationFrame(animId)
}

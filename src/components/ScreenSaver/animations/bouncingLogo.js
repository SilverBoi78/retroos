export default function bouncingLogo(ctx, width, height) {
  const text = 'RetroOS'
  const fontSize = Math.max(32, Math.min(64, width / 10))
  ctx.font = `bold ${fontSize}px Tahoma, Geneva, sans-serif`
  const textWidth = ctx.measureText(text).width
  const textHeight = fontSize

  let x = Math.random() * (width - textWidth)
  let y = Math.random() * (height - textHeight) + textHeight
  let dx = 2 + Math.random() * 2
  let dy = 2 + Math.random() * 2

  const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#88ff00']
  let colorIndex = 0
  let currentColor = colors[0]

  let animId = null

  function draw() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
    ctx.fillRect(0, 0, width, height)

    x += dx
    y += dy

    if (x <= 0 || x + textWidth >= width) {
      dx = -dx
      x = Math.max(0, Math.min(x, width - textWidth))
      colorIndex = (colorIndex + 1) % colors.length
      currentColor = colors[colorIndex]
    }
    if (y - textHeight <= 0 || y >= height) {
      dy = -dy
      y = Math.max(textHeight, Math.min(y, height))
      colorIndex = (colorIndex + 1) % colors.length
      currentColor = colors[colorIndex]
    }

    ctx.font = `bold ${fontSize}px Tahoma, Geneva, sans-serif`

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillText(text, x + 2, y + 2)

    // Main text
    ctx.fillStyle = currentColor
    ctx.fillText(text, x, y)

    animId = requestAnimationFrame(draw)
  }

  // Initial black fill
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, width, height)

  draw()

  return () => cancelAnimationFrame(animId)
}

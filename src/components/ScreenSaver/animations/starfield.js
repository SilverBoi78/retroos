export default function starfield(ctx, width, height) {
  const NUM_STARS = 200
  const stars = Array.from({ length: NUM_STARS }, () => ({
    x: (Math.random() - 0.5) * width * 2,
    y: (Math.random() - 0.5) * height * 2,
    z: Math.random() * width,
  }))

  const speed = 8
  let animId = null

  function draw() {
    ctx.fillStyle = '#000000'
    ctx.fillRect(0, 0, width, height)

    const cx = width / 2
    const cy = height / 2

    for (const star of stars) {
      star.z -= speed
      if (star.z <= 0) {
        star.x = (Math.random() - 0.5) * width * 2
        star.y = (Math.random() - 0.5) * height * 2
        star.z = width
      }

      const sx = (star.x / star.z) * width + cx
      const sy = (star.y / star.z) * height + cy

      if (sx < 0 || sx >= width || sy < 0 || sy >= height) continue

      const size = Math.max(0.5, (1 - star.z / width) * 3)
      const brightness = Math.min(255, Math.round((1 - star.z / width) * 255))

      ctx.fillStyle = `rgb(${brightness},${brightness},${brightness})`
      ctx.beginPath()
      ctx.arc(sx, sy, size, 0, Math.PI * 2)
      ctx.fill()
    }

    animId = requestAnimationFrame(draw)
  }

  draw()

  return () => cancelAnimationFrame(animId)
}

import { useRef, useEffect, useCallback, useState } from 'react'

export default function Canvas({
  pixels, canvasSize, zoom, tool, primaryColor,
  setPixel, floodFill, drawLine, drawRect, saveUndo,
}) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const dragStart = useRef(null)

  const w = canvasSize.width
  const h = canvasSize.height
  const displayW = w * zoom
  const displayH = h * zoom

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Clear
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, displayW, displayH)

    // Draw pixels
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const color = pixels[y * w + x]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x * zoom, y * zoom, zoom, zoom)
        }
      }
    }

    // Grid
    if (zoom >= 4) {
      ctx.strokeStyle = 'rgba(0,0,0,0.1)'
      ctx.lineWidth = 0.5
      for (let x = 0; x <= w; x++) {
        ctx.beginPath()
        ctx.moveTo(x * zoom, 0)
        ctx.lineTo(x * zoom, displayH)
        ctx.stroke()
      }
      for (let y = 0; y <= h; y++) {
        ctx.beginPath()
        ctx.moveTo(0, y * zoom)
        ctx.lineTo(displayW, y * zoom)
        ctx.stroke()
      }
    }
  }, [pixels, w, h, zoom, displayW, displayH])

  const getPixelCoords = useCallback((e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = Math.floor((e.clientX - rect.left) / zoom)
    const y = Math.floor((e.clientY - rect.top) / zoom)
    return { x, y }
  }, [zoom])

  const handleMouseDown = useCallback((e) => {
    const { x, y } = getPixelCoords(e)
    if (x < 0 || x >= w || y < 0 || y >= h) return

    if (tool === 'pencil') {
      saveUndo()
      setPixel(x, y, primaryColor)
      setIsDrawing(true)
    } else if (tool === 'eraser') {
      saveUndo()
      setPixel(x, y, null)
      setIsDrawing(true)
    } else if (tool === 'fill') {
      floodFill(x, y, primaryColor)
    } else if (tool === 'line' || tool === 'rectangle') {
      dragStart.current = { x, y }
      setIsDrawing(true)
    }
  }, [getPixelCoords, w, h, tool, primaryColor, setPixel, floodFill, saveUndo])

  const handleMouseMove = useCallback((e) => {
    if (!isDrawing) return
    const { x, y } = getPixelCoords(e)
    if (x < 0 || x >= w || y < 0 || y >= h) return

    if (tool === 'pencil') setPixel(x, y, primaryColor)
    else if (tool === 'eraser') setPixel(x, y, null)
  }, [isDrawing, getPixelCoords, w, h, tool, primaryColor, setPixel])

  const handleMouseUp = useCallback((e) => {
    if (!isDrawing) return
    setIsDrawing(false)

    if (dragStart.current && (tool === 'line' || tool === 'rectangle')) {
      const { x, y } = getPixelCoords(e)
      const { x: sx, y: sy } = dragStart.current
      if (tool === 'line') drawLine(sx, sy, x, y, primaryColor)
      if (tool === 'rectangle') drawRect(sx, sy, x, y, primaryColor)
      dragStart.current = null
    }
  }, [isDrawing, getPixelCoords, tool, primaryColor, drawLine, drawRect])

  return (
    <div className="pixelstudio-canvas-wrapper">
      <canvas
        ref={canvasRef}
        width={displayW}
        height={displayH}
        className="pixelstudio-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => setIsDrawing(false)}
      />
    </div>
  )
}

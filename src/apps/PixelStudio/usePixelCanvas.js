import { useState, useCallback, useRef } from 'react'

export default function usePixelCanvas(initialWidth = 16, initialHeight = 16) {
  const [canvasSize, setCanvasSize] = useState({ width: initialWidth, height: initialHeight })
  const [pixels, setPixels] = useState(() => new Array(initialWidth * initialHeight).fill(null))
  const [tool, setTool] = useState('pencil')
  const [primaryColor, setPrimaryColor] = useState('#000000')
  const [zoom, setZoom] = useState(12)
  const undoStack = useRef([])
  const redoStack = useRef([])

  const saveUndo = useCallback(() => {
    undoStack.current.push([...pixels])
    redoStack.current = []
    if (undoStack.current.length > 50) undoStack.current.shift()
  }, [pixels])

  const undo = useCallback(() => {
    if (undoStack.current.length === 0) return
    redoStack.current.push([...pixels])
    const prev = undoStack.current.pop()
    setPixels(prev)
  }, [pixels])

  const redo = useCallback(() => {
    if (redoStack.current.length === 0) return
    undoStack.current.push([...pixels])
    const next = redoStack.current.pop()
    setPixels(next)
  }, [pixels])

  const setPixel = useCallback((x, y, color) => {
    if (x < 0 || x >= canvasSize.width || y < 0 || y >= canvasSize.height) return
    setPixels(prev => {
      const next = [...prev]
      next[y * canvasSize.width + x] = color
      return next
    })
  }, [canvasSize])

  const getPixel = useCallback((x, y) => {
    if (x < 0 || x >= canvasSize.width || y < 0 || y >= canvasSize.height) return null
    return pixels[y * canvasSize.width + x]
  }, [pixels, canvasSize])

  const floodFill = useCallback((startX, startY, fillColor) => {
    const targetColor = getPixel(startX, startY)
    if (targetColor === fillColor) return

    saveUndo()
    setPixels(prev => {
      const next = [...prev]
      const w = canvasSize.width
      const h = canvasSize.height
      const stack = [[startX, startY]]

      while (stack.length > 0) {
        const [x, y] = stack.pop()
        if (x < 0 || x >= w || y < 0 || y >= h) continue
        if (next[y * w + x] !== targetColor) continue
        next[y * w + x] = fillColor
        stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1])
      }
      return next
    })
  }, [canvasSize, getPixel, saveUndo])

  const drawLine = useCallback((x0, y0, x1, y1, color) => {
    saveUndo()
    setPixels(prev => {
      const next = [...prev]
      const w = canvasSize.width
      const h = canvasSize.height
      let dx = Math.abs(x1 - x0)
      let dy = Math.abs(y1 - y0)
      let sx = x0 < x1 ? 1 : -1
      let sy = y0 < y1 ? 1 : -1
      let err = dx - dy
      let cx = x0, cy = y0

      while (true) {
        if (cx >= 0 && cx < w && cy >= 0 && cy < h) {
          next[cy * w + cx] = color
        }
        if (cx === x1 && cy === y1) break
        const e2 = 2 * err
        if (e2 > -dy) { err -= dy; cx += sx }
        if (e2 < dx) { err += dx; cy += sy }
      }
      return next
    })
  }, [canvasSize, saveUndo])

  const drawRect = useCallback((x0, y0, x1, y1, color) => {
    saveUndo()
    setPixels(prev => {
      const next = [...prev]
      const w = canvasSize.width
      const h = canvasSize.height
      const minX = Math.max(0, Math.min(x0, x1))
      const maxX = Math.min(w - 1, Math.max(x0, x1))
      const minY = Math.max(0, Math.min(y0, y1))
      const maxY = Math.min(h - 1, Math.max(y0, y1))

      for (let x = minX; x <= maxX; x++) {
        if (minY >= 0 && minY < h) next[minY * w + x] = color
        if (maxY >= 0 && maxY < h) next[maxY * w + x] = color
      }
      for (let y = minY; y <= maxY; y++) {
        if (minX >= 0 && minX < w) next[y * w + minX] = color
        if (maxX >= 0 && maxX < w) next[y * w + maxX] = color
      }
      return next
    })
  }, [canvasSize, saveUndo])

  const clearCanvas = useCallback(() => {
    saveUndo()
    setPixels(new Array(canvasSize.width * canvasSize.height).fill(null))
  }, [canvasSize, saveUndo])

  const newCanvas = useCallback((width, height) => {
    setCanvasSize({ width, height })
    setPixels(new Array(width * height).fill(null))
    undoStack.current = []
    redoStack.current = []
  }, [])

  const createExportCanvas = useCallback(() => {
    const canvas = document.createElement('canvas')
    canvas.width = canvasSize.width
    canvas.height = canvasSize.height
    const ctx = canvas.getContext('2d')

    for (let y = 0; y < canvasSize.height; y++) {
      for (let x = 0; x < canvasSize.width; x++) {
        const color = pixels[y * canvasSize.width + x]
        if (color) {
          ctx.fillStyle = color
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }
    return canvas
  }, [pixels, canvasSize])

  const exportToPng = useCallback(() => {
    return createExportCanvas().toDataURL('image/png')
  }, [createExportCanvas])

  const exportToBlob = useCallback(() => {
    return new Promise((resolve) => {
      createExportCanvas().toBlob(resolve, 'image/png')
    })
  }, [createExportCanvas])

  return {
    canvasSize, pixels, tool, primaryColor, zoom,
    setTool, setPrimaryColor, setZoom,
    setPixel, getPixel, floodFill, drawLine, drawRect,
    clearCanvas, newCanvas, exportToPng, exportToBlob,
    undo, redo, saveUndo,
  }
}

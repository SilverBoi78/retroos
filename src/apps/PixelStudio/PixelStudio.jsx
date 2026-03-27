import { useState, useCallback, useEffect } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import { useNotification } from '../../context/NotificationContext'
import usePixelCanvas from './usePixelCanvas'
import Canvas from './Canvas'
import Toolbar from './Toolbar'
import ColorPalette from './ColorPalette'
import './PixelStudio.css'

const SIZES = [
  { label: '16x16', w: 16, h: 16 },
  { label: '32x32', w: 32, h: 32 },
  { label: '64x64', w: 64, h: 64 },
]

export default function PixelStudio() {
  const { writeFile } = useFileSystem()
  const { notify } = useNotification()
  const canvas = usePixelCanvas(32, 32)
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saveName, setSaveName] = useState('artwork')

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.key === 'z') { e.preventDefault(); canvas.undo() }
      if (e.ctrlKey && e.key === 'y') { e.preventDefault(); canvas.redo() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canvas.undo, canvas.redo])

  const handleSave = useCallback(() => {
    const dataUrl = canvas.exportToPng()
    const fileName = saveName.trim() || 'artwork'
    writeFile(`/Pictures/${fileName}.png`, dataUrl)
    setShowSaveDialog(false)
    notify(`Saved ${fileName}.png`, { type: 'success' })
  }, [canvas, saveName, writeFile, notify])

  return (
    <div className="pixelstudio">
      <div className="pixelstudio__menu-bar">
        <button className="pixelstudio__menu-btn" onClick={() => setShowNewDialog(true)}>New</button>
        <button className="pixelstudio__menu-btn" onClick={() => setShowSaveDialog(true)}>Save</button>
        <div className="pixelstudio__zoom">
          <button
            className="pixelstudio__menu-btn"
            onClick={() => canvas.setZoom(z => Math.max(2, z - 2))}
          >-</button>
          <span className="pixelstudio__zoom-label">{canvas.zoom}x</span>
          <button
            className="pixelstudio__menu-btn"
            onClick={() => canvas.setZoom(z => Math.min(24, z + 2))}
          >+</button>
        </div>
      </div>

      <div className="pixelstudio__workspace">
        <Toolbar
          tool={canvas.tool}
          setTool={canvas.setTool}
          onUndo={canvas.undo}
          onRedo={canvas.redo}
          onClear={canvas.clearCanvas}
        />

        <div className="pixelstudio__canvas-area">
          <Canvas
            pixels={canvas.pixels}
            canvasSize={canvas.canvasSize}
            zoom={canvas.zoom}
            tool={canvas.tool}
            primaryColor={canvas.primaryColor}
            setPixel={canvas.setPixel}
            floodFill={canvas.floodFill}
            drawLine={canvas.drawLine}
            drawRect={canvas.drawRect}
            saveUndo={canvas.saveUndo}
          />
        </div>

        <ColorPalette
          primaryColor={canvas.primaryColor}
          setPrimaryColor={canvas.setPrimaryColor}
        />
      </div>

      <div className="pixelstudio__status">
        {canvas.canvasSize.width}x{canvas.canvasSize.height} | Tool: {canvas.tool}
      </div>

      {showNewDialog && (
        <div className="pixelstudio__dialog-overlay">
          <div className="pixelstudio__dialog">
            <div className="pixelstudio__dialog-title">New Canvas</div>
            <div className="pixelstudio__dialog-body">
              {SIZES.map(s => (
                <button
                  key={s.label}
                  className="pixelstudio__dialog-btn"
                  onClick={() => { canvas.newCanvas(s.w, s.h); setShowNewDialog(false) }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <button className="pixelstudio__dialog-cancel" onClick={() => setShowNewDialog(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showSaveDialog && (
        <div className="pixelstudio__dialog-overlay">
          <div className="pixelstudio__dialog">
            <div className="pixelstudio__dialog-title">Save to /Pictures</div>
            <div className="pixelstudio__dialog-body">
              <input
                type="text"
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                className="pixelstudio__dialog-input"
                placeholder="filename"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSave()}
              />
              <span className="pixelstudio__dialog-ext">.png</span>
            </div>
            <div className="pixelstudio__dialog-actions">
              <button className="pixelstudio__dialog-btn" onClick={handleSave}>Save</button>
              <button className="pixelstudio__dialog-cancel" onClick={() => setShowSaveDialog(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

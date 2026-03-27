const TOOLS = [
  { id: 'pencil', label: '✏', title: 'Pencil' },
  { id: 'eraser', label: '◻', title: 'Eraser' },
  { id: 'fill', label: '◧', title: 'Fill' },
  { id: 'line', label: '╲', title: 'Line' },
  { id: 'rectangle', label: '▭', title: 'Rectangle' },
]

export default function Toolbar({ tool, setTool, onUndo, onRedo, onClear }) {
  return (
    <div className="pixelstudio-toolbar">
      {TOOLS.map(t => (
        <button
          key={t.id}
          className={`pixelstudio-toolbar__btn${tool === t.id ? ' active' : ''}`}
          onClick={() => setTool(t.id)}
          title={t.title}
        >
          {t.label}
        </button>
      ))}
      <div className="pixelstudio-toolbar__divider" />
      <button className="pixelstudio-toolbar__btn" onClick={onUndo} title="Undo (Ctrl+Z)">↩</button>
      <button className="pixelstudio-toolbar__btn" onClick={onRedo} title="Redo (Ctrl+Y)">↪</button>
      <div className="pixelstudio-toolbar__divider" />
      <button className="pixelstudio-toolbar__btn" onClick={onClear} title="Clear Canvas">🗑</button>
    </div>
  )
}

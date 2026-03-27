const PRESET_COLORS = [
  '#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00',
  '#ff00ff', '#00ffff', '#ff8800', '#8800ff', '#0088ff', '#88ff00',
  '#880000', '#008800', '#000088', '#888888',
  '#ff4444', '#44ff44', '#4444ff', '#ffcc44',
  '#cc44ff', '#44ccff', '#ff8844', '#44ff88',
  '#554400', '#004455', '#440055', '#cccccc',
  '#ffccaa', '#aaccff', '#aaffcc', '#333333',
]

export default function ColorPalette({ primaryColor, setPrimaryColor }) {
  return (
    <div className="pixelstudio-palette">
      <div className="pixelstudio-palette__current">
        <div
          className="pixelstudio-palette__swatch-large"
          style={{ background: primaryColor }}
        />
        <input
          type="color"
          value={primaryColor}
          onChange={e => setPrimaryColor(e.target.value)}
          className="pixelstudio-palette__picker"
        />
      </div>
      <div className="pixelstudio-palette__grid">
        {PRESET_COLORS.map((color, i) => (
          <button
            key={i}
            className={`pixelstudio-palette__swatch${primaryColor === color ? ' active' : ''}`}
            style={{ background: color }}
            onClick={() => setPrimaryColor(color)}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}

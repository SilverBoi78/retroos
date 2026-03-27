export default function TransportBar({
  isPlaying, bpm, loop,
  onPlay, onStop, onBpmChange, onLoopToggle,
}) {
  return (
    <div className="chiptune-transport">
      <button
        className={`chiptune-transport__btn${isPlaying ? ' active' : ''}`}
        onClick={isPlaying ? onStop : onPlay}
      >
        {isPlaying ? '■ Stop' : '▶ Play'}
      </button>

      <div className="chiptune-transport__bpm">
        <span className="chiptune-transport__label">BPM:</span>
        <input
          type="number"
          min="60"
          max="240"
          value={bpm}
          onChange={e => onBpmChange(Number(e.target.value) || 120)}
          className="chiptune-transport__input"
        />
      </div>

      <button
        className={`chiptune-transport__btn${loop ? ' active' : ''}`}
        onClick={onLoopToggle}
      >
        ⟳ Loop
      </button>
    </div>
  )
}

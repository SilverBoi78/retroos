const WAVEFORMS = [
  { id: 'square', label: '◻ Square' },
  { id: 'triangle', label: '△ Triangle' },
  { id: 'sawtooth', label: '⩘ Sawtooth' },
  { id: 'sine', label: '∿ Sine' },
]

const TRACK_COLORS = ['#ff4444', '#44ccff', '#44ff88', '#ffcc44']

export default function InstrumentPanel({
  tracks, activeTrack, setActiveTrack, onUpdateTrack,
}) {
  const track = tracks[activeTrack]

  return (
    <div className="chiptune-instruments">
      <div className="chiptune-instruments__tracks">
        {tracks.map((t, i) => (
          <button
            key={i}
            className={`chiptune-instruments__track-btn${i === activeTrack ? ' active' : ''}`}
            onClick={() => setActiveTrack(i)}
            style={{ borderColor: TRACK_COLORS[i] }}
          >
            T{i + 1}
          </button>
        ))}
      </div>

      <div className="chiptune-instruments__section">
        <div className="chiptune-instruments__label">Waveform</div>
        <div className="chiptune-instruments__waveforms">
          {WAVEFORMS.map(w => (
            <button
              key={w.id}
              className={`chiptune-instruments__wave-btn${track?.waveform === w.id ? ' active' : ''}`}
              onClick={() => onUpdateTrack(activeTrack, { waveform: w.id })}
            >
              {w.label}
            </button>
          ))}
        </div>
      </div>

      <div className="chiptune-instruments__section">
        <div className="chiptune-instruments__label">Volume</div>
        <input
          type="range"
          min="0"
          max="100"
          value={(track?.volume || 0.4) * 100}
          onChange={e => onUpdateTrack(activeTrack, { volume: e.target.value / 100 })}
          className="chiptune-instruments__slider"
        />
      </div>
    </div>
  )
}

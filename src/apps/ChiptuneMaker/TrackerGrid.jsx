import { useRef, useEffect } from 'react'
import { noteList } from './noteFrequencies'

const VISIBLE_NOTES = noteList.slice().reverse()
const CELL_W = 20
const CELL_H = 14

export default function TrackerGrid({
  tracks, activeTrack, steps, playbackPosition,
  onToggleNote,
}) {
  const scrollRef = useRef(null)

  useEffect(() => {
    if (playbackPosition >= 0 && scrollRef.current) {
      const el = scrollRef.current
      const targetX = playbackPosition * CELL_W
      if (targetX < el.scrollLeft || targetX > el.scrollLeft + el.clientWidth - CELL_W * 2) {
        el.scrollLeft = targetX - 40
      }
    }
  }, [playbackPosition])

  const track = tracks[activeTrack]
  if (!track) return null

  return (
    <div className="chiptune-grid-wrapper" ref={scrollRef}>
      <div
        className="chiptune-grid"
        style={{
          gridTemplateColumns: `60px repeat(${steps}, ${CELL_W}px)`,
          gridTemplateRows: `repeat(${VISIBLE_NOTES.length}, ${CELL_H}px)`,
        }}
      >
        {VISIBLE_NOTES.map((note, row) => (
          <div key={note} className={`chiptune-grid__label${note.includes('#') ? ' sharp' : ''}`}>
            {note}
          </div>
        ))}

        {VISIBLE_NOTES.map((note, row) => (
          Array.from({ length: steps }, (_, col) => {
            const isActive = track.notes[col] === note
            const isPlayhead = col === playbackPosition
            const isBeat = col % 4 === 0

            return (
              <div
                key={`${row}-${col}`}
                className={
                  `chiptune-grid__cell` +
                  (isActive ? ' active' : '') +
                  (isPlayhead ? ' playhead' : '') +
                  (isBeat ? ' beat' : '') +
                  (note.includes('#') ? ' sharp-row' : '')
                }
                style={{ gridRow: row + 1, gridColumn: col + 2 }}
                onClick={() => onToggleNote(activeTrack, col, isActive ? null : note)}
              />
            )
          })
        ))}
      </div>
    </div>
  )
}

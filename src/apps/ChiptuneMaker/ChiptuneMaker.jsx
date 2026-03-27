import { useState, useCallback } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import TrackerGrid from './TrackerGrid'
import InstrumentPanel from './InstrumentPanel'
import TransportBar from './TransportBar'
import useAudioEngine from './useAudioEngine'
import './ChiptuneMaker.css'

const DEFAULT_STEPS = 32

function createDefaultTracks() {
  return [
    { waveform: 'square', volume: 0.4, notes: new Array(DEFAULT_STEPS).fill(null) },
    { waveform: 'triangle', volume: 0.4, notes: new Array(DEFAULT_STEPS).fill(null) },
    { waveform: 'sawtooth', volume: 0.3, notes: new Array(DEFAULT_STEPS).fill(null) },
    { waveform: 'sine', volume: 0.3, notes: new Array(DEFAULT_STEPS).fill(null) },
  ]
}

export default function ChiptuneMaker() {
  const { readFile, writeFile } = useFileSystem()
  const [tracks, setTracks] = useState(createDefaultTracks)
  const [activeTrack, setActiveTrack] = useState(0)
  const [bpm, setBpm] = useState(120)
  const [loop, setLoop] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackPosition, setPlaybackPosition] = useState(-1)
  const { playSong, stopAll } = useAudioEngine()

  const handleToggleNote = useCallback((trackIdx, step, note) => {
    setTracks(prev => {
      const next = prev.map((t, i) => i === trackIdx ? { ...t, notes: [...t.notes] } : t)
      next[trackIdx].notes[step] = note
      return next
    })
  }, [])

  const handleUpdateTrack = useCallback((trackIdx, updates) => {
    setTracks(prev => prev.map((t, i) => i === trackIdx ? { ...t, ...updates } : t))
  }, [])

  const handlePlay = useCallback(() => {
    setIsPlaying(true)
    playSong(tracks, bpm, DEFAULT_STEPS, loop, (pos) => {
      if (pos < 0) {
        setIsPlaying(false)
        setPlaybackPosition(-1)
      } else {
        setPlaybackPosition(pos)
      }
    })
  }, [tracks, bpm, loop, playSong])

  const handleStop = useCallback(() => {
    stopAll()
    setIsPlaying(false)
    setPlaybackPosition(-1)
  }, [stopAll])

  const handleNew = useCallback(() => {
    handleStop()
    setTracks(createDefaultTracks())
  }, [handleStop])

  const handleSave = useCallback(() => {
    const data = JSON.stringify({ bpm, tracks: tracks.map(t => ({ waveform: t.waveform, volume: t.volume, notes: t.notes })) })
    const name = `song_${new Date().toISOString().slice(0, 10)}`
    writeFile(`/Music/${name}.json`, data)
  }, [bpm, tracks, writeFile])

  const handleLoad = useCallback(() => {
    const raw = readFile('/Music')
    // Simple: just list files and load the first one found
    // In a full version, this would use FileDialog
  }, [readFile])

  return (
    <div className="chiptune">
      <div className="chiptune__menu-bar">
        <button className="chiptune__menu-btn" onClick={handleNew}>New</button>
        <button className="chiptune__menu-btn" onClick={handleSave}>Save</button>
        <TransportBar
          isPlaying={isPlaying}
          bpm={bpm}
          loop={loop}
          onPlay={handlePlay}
          onStop={handleStop}
          onBpmChange={setBpm}
          onLoopToggle={() => setLoop(l => !l)}
        />
      </div>

      <div className="chiptune__workspace">
        <div className="chiptune__grid-area">
          <TrackerGrid
            tracks={tracks}
            activeTrack={activeTrack}
            steps={DEFAULT_STEPS}
            playbackPosition={playbackPosition}
            onToggleNote={handleToggleNote}
          />
        </div>

        <InstrumentPanel
          tracks={tracks}
          activeTrack={activeTrack}
          setActiveTrack={setActiveTrack}
          onUpdateTrack={handleUpdateTrack}
        />
      </div>
    </div>
  )
}

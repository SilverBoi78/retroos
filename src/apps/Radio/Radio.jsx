import { useState, useCallback } from 'react'
import stations from './stations'
import StationList from './StationList'
import NowPlaying from './NowPlaying'
import useRadioPlayer from './useRadioPlayer'
import './Radio.css'

export default function Radio() {
  const [currentStation, setCurrentStation] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const { play, stop, setVolume: setPlayerVolume } = useRadioPlayer()

  const handleSelectStation = useCallback((station) => {
    setCurrentStation(station)
    if (isPlaying) {
      play(station, volume)
    }
  }, [isPlaying, play, volume])

  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      stop()
      setIsPlaying(false)
    } else if (currentStation) {
      play(currentStation, volume)
      setIsPlaying(true)
    }
  }, [isPlaying, currentStation, play, stop, volume])

  const handleVolumeChange = useCallback((e) => {
    const v = Number(e.target.value) / 100
    setVolume(v)
    setPlayerVolume(v)
  }, [setPlayerVolume])

  const handlePrev = useCallback(() => {
    if (!currentStation) return
    const idx = stations.findIndex(s => s.id === currentStation.id)
    const prev = stations[(idx - 1 + stations.length) % stations.length]
    setCurrentStation(prev)
    if (isPlaying) play(prev, volume)
  }, [currentStation, isPlaying, play, volume])

  const handleNext = useCallback(() => {
    if (!currentStation) return
    const idx = stations.findIndex(s => s.id === currentStation.id)
    const next = stations[(idx + 1) % stations.length]
    setCurrentStation(next)
    if (isPlaying) play(next, volume)
  }, [currentStation, isPlaying, play, volume])

  return (
    <div className="radio">
      <div className="radio__display">
        <NowPlaying station={currentStation} isPlaying={isPlaying} />
      </div>

      <div className="radio__controls">
        <button className="radio__btn" onClick={handlePrev}>⏮</button>
        <button className="radio__btn radio__btn--play" onClick={handleTogglePlay}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button className="radio__btn" onClick={handleNext}>⏭</button>
      </div>

      <div className="radio__volume">
        <span className="radio__volume-label">Vol</span>
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={handleVolumeChange}
          className="radio__volume-slider"
        />
      </div>

      <StationList
        stations={stations}
        currentStation={currentStation}
        onSelect={handleSelectStation}
      />
    </div>
  )
}

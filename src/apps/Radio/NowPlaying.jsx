export default function NowPlaying({ station, isPlaying }) {
  if (!station) {
    return (
      <div className="radio-now-playing">
        <div className="radio-now-playing__empty">Select a station</div>
      </div>
    )
  }

  return (
    <div className="radio-now-playing" style={{ '--station-color': station.color }}>
      <div className="radio-now-playing__name">{station.name}</div>
      <div className="radio-now-playing__genre">{station.genre}</div>
      {isPlaying && (
        <div className="radio-now-playing__eq">
          <div className="radio-eq-bar" style={{ animationDelay: '0s' }} />
          <div className="radio-eq-bar" style={{ animationDelay: '0.2s' }} />
          <div className="radio-eq-bar" style={{ animationDelay: '0.1s' }} />
          <div className="radio-eq-bar" style={{ animationDelay: '0.3s' }} />
          <div className="radio-eq-bar" style={{ animationDelay: '0.15s' }} />
        </div>
      )}
    </div>
  )
}

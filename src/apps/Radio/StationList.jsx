export default function StationList({ stations, currentStation, onSelect }) {
  return (
    <div className="radio-stations">
      {stations.map(station => (
        <button
          key={station.id}
          className={`radio-stations__item${currentStation?.id === station.id ? ' active' : ''}`}
          onClick={() => onSelect(station)}
        >
          <div
            className="radio-stations__dot"
            style={{ background: station.color }}
          />
          <div className="radio-stations__info">
            <div className="radio-stations__name">{station.name}</div>
            <div className="radio-stations__genre">{station.genre}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

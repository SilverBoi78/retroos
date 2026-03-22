export default function PastAdventures({ savedGames, readingContent, readingName, onSelectGame, onBack, screen }) {
  if (screen === 'reading') {
    return (
      <div className="realms__past">
        <div className="realms__past-header">
          <button className="realms__past-back" onClick={onBack}>
            ← Back to List
          </button>
          <span className="realms__past-title">{readingName}</span>
        </div>
        <div className="realms__past-reader">
          <pre className="realms__past-transcript">{readingContent}</pre>
        </div>
      </div>
    )
  }

  return (
    <div className="realms__past">
      <div className="realms__past-header">
        <button className="realms__past-back" onClick={onBack}>
          ← Back to Menu
        </button>
        <span className="realms__past-title">Past Adventures</span>
      </div>
      <div className="realms__past-list">
        {savedGames.length === 0 ? (
          <div className="realms__past-empty">
            No adventures yet. Start a new game to write your first tale!
          </div>
        ) : (
          savedGames.map((game) => (
            <button
              key={game.name}
              className="realms__past-item"
              onClick={() => onSelectGame(game)}
            >
              <span className="realms__past-item-icon">📜</span>
              <span className="realms__past-item-name">{game.name}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

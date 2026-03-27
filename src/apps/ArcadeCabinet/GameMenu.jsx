const GAMES = [
  { id: 'breakout', name: 'Breakout', desc: 'Smash bricks with a bouncing ball', color: '#ff4444' },
  { id: 'shooter', name: 'Space Shooter', desc: 'Defend Earth from alien invaders', color: '#44ccff' },
  { id: 'pong', name: 'Pong', desc: 'Classic paddle vs AI opponent', color: '#ffffff' },
  { id: 'runner', name: 'Runner', desc: 'Jump over obstacles, run forever', color: '#44ccff' },
]

export { GAMES }

export default function GameMenu({ onSelectGame, getScores }) {
  return (
    <div className="arcade-menu">
      <div className="arcade-menu__title">ARCADE</div>
      <div className="arcade-menu__subtitle">Select a game</div>

      <div className="arcade-menu__grid">
        {GAMES.map(game => {
          const scores = getScores(game.id)
          return (
            <button
              key={game.id}
              className="arcade-menu__card"
              onClick={() => onSelectGame(game.id)}
            >
              <div className="arcade-menu__card-icon" style={{ color: game.color }}>
                {game.id === 'breakout' && '▮▮▮'}
                {game.id === 'shooter' && '▲'}
                {game.id === 'pong' && '|  ●  |'}
                {game.id === 'runner' && '►'}
              </div>
              <div className="arcade-menu__card-name">{game.name}</div>
              <div className="arcade-menu__card-desc">{game.desc}</div>
              {scores.length > 0 && (
                <div className="arcade-menu__card-score">Best: {scores[0]}</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

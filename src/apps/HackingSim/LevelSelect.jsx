import levels from './levels/index'

const TYPE_LABELS = {
  cipher: 'CIPHER',
  password: 'PASSWORD',
  filesystem: 'FILESYSTEM',
  exploit: 'EXPLOIT',
}

const TYPE_COLORS = {
  cipher: '#44ccff',
  password: '#ffcc44',
  filesystem: '#44ff88',
  exploit: '#ff4466',
}

export default function LevelSelect({ unlockedLevel, completedLevels, onSelectLevel }) {
  return (
    <div className="hackingsim-levels">
      <div className="hackingsim-levels__title">HACKING SIMULATOR</div>
      <div className="hackingsim-levels__subtitle">Select a mission</div>

      <div className="hackingsim-levels__grid">
        {levels.map((level) => {
          const isUnlocked = level.id <= unlockedLevel
          const isCompleted = completedLevels.includes(level.id)

          return (
            <button
              key={level.id}
              className={`hackingsim-levels__card${!isUnlocked ? ' locked' : ''}${isCompleted ? ' completed' : ''}`}
              onClick={() => isUnlocked && onSelectLevel(level.id)}
              disabled={!isUnlocked}
            >
              <div className="hackingsim-levels__card-header">
                <span className="hackingsim-levels__card-num">#{level.id}</span>
                <span
                  className="hackingsim-levels__card-type"
                  style={{ color: TYPE_COLORS[level.type] }}
                >
                  {TYPE_LABELS[level.type]}
                </span>
              </div>
              <div className="hackingsim-levels__card-name">
                {isUnlocked ? level.name : '???'}
              </div>
              {isCompleted && <div className="hackingsim-levels__card-check">CLEARED</div>}
              {!isUnlocked && <div className="hackingsim-levels__card-lock">LOCKED</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

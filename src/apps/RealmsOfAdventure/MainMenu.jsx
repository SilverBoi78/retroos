import { useState } from 'react'
import { REALMS, DETAIL_LEVELS } from './systemPrompt'

export default function MainMenu({ onNewGame, onViewPast, isLoading, error }) {
  const [selectedRealm, setSelectedRealm] = useState('fantasy')
  const [detailLevel, setDetailLevel] = useState('detailed')

  function handleStart() {
    onNewGame(selectedRealm, detailLevel)
  }

  return (
    <div className="realms__menu">
      <div className="realms__menu-content">
        <div className="realms__menu-title">
          <span className="realms__menu-icon">⚔</span>
          <h1 className="realms__menu-heading">Realms of Adventure</h1>
          <p className="realms__menu-tagline">Choose your realm and begin...</p>
        </div>

        <div className="realms__menu-section">
          <span className="realms__menu-label">Choose Your Realm</span>
          <div className="realms__realm-grid">
            {REALMS.map((realm) => (
              <button
                key={realm.id}
                className={`realms__realm-btn ${selectedRealm === realm.id ? 'realms__realm-btn--active' : ''}`}
                onClick={() => setSelectedRealm(realm.id)}
                disabled={isLoading}
              >
                <span className="realms__realm-icon">{realm.icon}</span>
                <span className="realms__realm-name">{realm.name}</span>
                <span className="realms__realm-desc">{realm.description}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="realms__menu-section">
          <span className="realms__menu-label">Story Detail</span>
          <div className="realms__detail-row">
            {DETAIL_LEVELS.map((level) => (
              <button
                key={level.id}
                className={`realms__detail-btn ${detailLevel === level.id ? 'realms__detail-btn--active' : ''}`}
                onClick={() => setDetailLevel(level.id)}
                disabled={isLoading}
                title={level.description}
              >
                {level.name}
              </button>
            ))}
          </div>
        </div>

        <div className="realms__menu-buttons">
          <button
            className="realms__menu-btn realms__menu-btn--primary"
            onClick={handleStart}
            disabled={isLoading}
          >
            {isLoading ? 'Summoning the Game Master...' : 'Begin Adventure'}
          </button>
          <button
            className="realms__menu-btn"
            onClick={onViewPast}
            disabled={isLoading}
          >
            Past Adventures
          </button>
        </div>

        {error && (
          <div className="realms__menu-error">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

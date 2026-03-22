import { useState, useRef, useEffect } from 'react'

export default function GameScreen({ messages, turnCount, gameOver, isLoading, onSendMessage, onBackToMenu, realmName }) {
  const [input, setInput] = useState('')
  const chatEndRef = useRef(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  function handleSubmit(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text || isLoading || gameOver) return
    setInput('')
    onSendMessage(text)
  }

  // Filter out system messages and the initial kickoff "Begin the adventure." message
  const visibleMessages = messages.filter((m, i) => {
    if (m.role === 'system') return false
    if (i === 1 && m.role === 'user' && m.content === 'Begin the adventure.') return false
    return true
  })

  return (
    <div className="realms__game">
      <div className="realms__game-header">
        <span className="realms__game-realm">{realmName}</span>
        <span className="realms__game-turn">Turn {turnCount}</span>
        <button className="realms__game-quit" onClick={onBackToMenu}>
          {gameOver ? 'Return to Menu' : 'Quit'}
        </button>
      </div>

      <div className="realms__chat-log">
        {visibleMessages.map((msg, i) => (
          <div
            key={i}
            className={`realms__message ${msg.role === 'assistant' ? 'realms__message--dm' : 'realms__message--player'}`}
          >
            <span className="realms__message-label">
              {msg.role === 'assistant' ? 'Game Master' : 'Adventurer'}
            </span>
            <div className="realms__message-text">{msg.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="realms__message realms__message--dm">
            <span className="realms__message-label">Game Master</span>
            <div className="realms__message-text realms__loading">
              The Game Master is thinking<span className="realms__loading-dots">...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {!gameOver ? (
        <form className="realms__input-area" onSubmit={handleSubmit}>
          <input
            className="realms__input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isLoading ? 'Waiting for the Game Master...' : 'What do you do?'}
            disabled={isLoading}
            autoFocus
          />
          <button
            className="realms__send-btn"
            type="submit"
            disabled={isLoading || !input.trim()}
          >
            Send
          </button>
        </form>
      ) : (
        <div className="realms__game-over">
          <span className="realms__game-over-text">The adventure has ended. Your tale has been saved.</span>
        </div>
      )}
    </div>
  )
}

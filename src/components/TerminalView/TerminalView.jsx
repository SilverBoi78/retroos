import { useRef, useEffect, useState } from 'react'
import './TerminalView.css'

export default function TerminalView({
  history,
  prompt = '$',
  onCommand,
  getCompletions,
  className = '',
  autoFocus = true,
}) {
  const [currentInput, setCurrentInput] = useState('')
  const [commandHistory, setCommandHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const containerRef = useRef(null)
  const inputRef = useRef(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'instant' })
  }, [history])

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus()
    }
  }, [autoFocus])

  function handleKeyDown(e) {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (!getCompletions) return
      const completions = getCompletions(currentInput)
      if (completions.length === 0) return
      if (completions.length === 1) {
        setCurrentInput(completions[0])
      } else {
        let prefix = completions[0]
        for (let i = 1; i < completions.length; i++) {
          while (!completions[i].startsWith(prefix)) {
            prefix = prefix.slice(0, -1)
          }
        }
        if (prefix.length > currentInput.length) {
          setCurrentInput(prefix)
        }
      }
      return
    }
    if (e.key === 'Enter') {
      e.preventDefault()
      const cmd = currentInput.trim()
      if (cmd) {
        setCommandHistory(prev => [...prev, cmd])
      }
      setHistoryIndex(-1)
      onCommand(currentInput)
      setCurrentInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length === 0) return
      const newIndex = historyIndex === -1
        ? commandHistory.length - 1
        : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIndex)
      setCurrentInput(commandHistory[newIndex])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      if (historyIndex >= commandHistory.length - 1) {
        setHistoryIndex(-1)
        setCurrentInput('')
      } else {
        const newIndex = historyIndex + 1
        setHistoryIndex(newIndex)
        setCurrentInput(commandHistory[newIndex])
      }
    }
  }

  function handleContainerClick() {
    const sel = window.getSelection()
    if (sel && sel.toString().length > 0) return
    inputRef.current?.focus()
  }

  return (
    <div
      className={`terminal-view ${className}`}
      onClick={handleContainerClick}
      ref={containerRef}
    >
      <div className="terminal-view__output">
        {history.map((entry, i) => (
          <div key={i} className={`terminal-view__line terminal-view__line--${entry.type}`}>
            {entry.type === 'input' && (
              <span className="terminal-view__prompt">{entry.prompt || prompt} </span>
            )}
            <span className="terminal-view__text">{entry.text}</span>
          </div>
        ))}
      </div>
      <div className="terminal-view__input-line">
        <span className="terminal-view__prompt">{prompt} </span>
        <input
          ref={inputRef}
          className="terminal-view__input"
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div ref={bottomRef} />
    </div>
  )
}

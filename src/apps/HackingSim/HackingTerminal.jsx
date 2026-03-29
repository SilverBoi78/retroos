import { useState, useCallback, useEffect } from 'react'
import TerminalView from '../../components/TerminalView/TerminalView'

export default function HackingTerminal({ level, onSolved, onBack }) {
  const [history, setHistory] = useState([])
  const [handler, setHandler] = useState(null)

  useEffect(() => {
    const initial = [
      { type: 'system', text: `═══ MISSION ${level.id}: ${level.name} ═══` },
      { type: 'output', text: '' },
      { type: 'output', text: level.briefing },
      { type: 'output', text: '' },
      ...(level.initialOutput || []),
      { type: 'output', text: '' },
    ]
    setHistory(initial)
    setHandler(() => level.createHandler())
  }, [level])

  const handleCommand = useCallback((input) => {
    const trimmed = input.trim()
    setHistory(prev => [...prev, { type: 'input', text: trimmed }])

    if (!trimmed) return

    if (trimmed === 'back' || trimmed === 'quit' || trimmed === 'exit') {
      onBack()
      return
    }

    if (!handler) return

    const parts = trimmed.split(/\s+/)
    const cmd = parts[0].toLowerCase()
    const args = parts.slice(1)

    const result = handler(cmd, args)

    if (result.output) {
      setHistory(prev => [...prev, { type: result.type || 'output', text: result.output }])
    }

    if (result.solved) {
      setHistory(prev => [...prev,
        { type: 'output', text: '' },
        { type: 'success', text: '═══ MISSION COMPLETE ═══' },
      ])
      setTimeout(() => onSolved(level.id), 1500)
    }

    if (result.failed) {
      setHistory(prev => [...prev,
        { type: 'output', text: '' },
        { type: 'error', text: '═══ MISSION FAILED ═══' },
        { type: 'output', text: 'Type "back" to return to mission select.' },
      ])
    }
  }, [handler, level.id, onSolved, onBack])

  return (
    <div className="hackingsim-terminal-wrapper">
      <div className="hackingsim-terminal-header">
        <button onClick={onBack} className="hackingsim-back-btn">&#8592; Back</button>
        <span className="hackingsim-mission-title">MISSION {level.id}: {level.name}</span>
      </div>
      <TerminalView
        history={history}
        prompt="hack$"
        onCommand={handleCommand}
        className="hackingsim-terminal"
      />
    </div>
  )
}

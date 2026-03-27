import { useState, useCallback } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import { useAuth } from '../../context/AuthContext'
import { executeCommand } from './commands'
import TerminalView from '../../components/TerminalView/TerminalView'
import './Terminal.css'

export default function Terminal() {
  const [history, setHistory] = useState([
    { type: 'system', text: 'RetroOS Terminal v1.0' },
    { type: 'system', text: "Type 'help' for available commands.\n" },
  ])
  const [cwd, setCwd] = useState('/')
  const fs = useFileSystem()
  const { user } = useAuth()

  const handleCommand = useCallback((input) => {
    const trimmed = input.trim()

    setHistory(prev => [...prev, { type: 'input', text: trimmed }])

    if (!trimmed) return

    const result = executeCommand(trimmed, fs, cwd, { user })

    if (result.clear) {
      setHistory([])
      return
    }

    if (result.newCwd) {
      setCwd(result.newCwd)
    }

    if (result.output !== undefined && result.output !== '') {
      setHistory(prev => [...prev, {
        type: result.type || 'output',
        text: result.output,
      }])
    }
  }, [fs, cwd, user])

  const prompt = `${user?.username || 'guest'}@retroos:${cwd}$`

  return (
    <div className="terminal-app">
      <TerminalView
        history={history}
        prompt={prompt}
        onCommand={handleCommand}
      />
    </div>
  )
}

import { useState, useCallback } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import { useAuth } from '../../context/AuthContext'
import { executeCommand } from './commands'
import { resolvePath } from '../../utils/pathUtils'
import TerminalView from '../../components/TerminalView/TerminalView'
import './Terminal.css'

const COMMANDS = ['ls', 'cd', 'cat', 'mkdir', 'rm', 'touch', 'echo', 'pwd', 'whoami', 'date', 'clear', 'help']

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
    const currentPrompt = `${user?.username || 'guest'}@retroos:${cwd}$`

    setHistory(prev => [...prev, { type: 'input', text: trimmed, prompt: currentPrompt }])

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

  const getCompletions = useCallback((input) => {
    const trimmed = input.replace(/^\s+/, '')
    const parts = trimmed.split(/\s+/)

    if (parts.length <= 1 && !trimmed.endsWith(' ') && trimmed.length > 0) {
      const prefix = parts[0].toLowerCase()
      const matches = COMMANDS.filter(c => c.startsWith(prefix))
      return matches.map(c => c + ' ')
    }

    if (parts.length < 2) return []
    const partial = parts[parts.length - 1]
    const beforePartial = partial ? input.slice(0, input.lastIndexOf(partial)) : input

    const lastSlash = partial.lastIndexOf('/')
    let dirPath, namePrefix
    if (lastSlash >= 0) {
      dirPath = resolvePath(cwd, partial.slice(0, lastSlash) || '/')
      namePrefix = partial.slice(lastSlash + 1)
    } else {
      dirPath = cwd
      namePrefix = partial
    }

    const entries = fs.readDir(dirPath)
    if (!entries) return []

    return entries
      .filter(e => e.name.startsWith(namePrefix))
      .map(e => {
        const base = lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : ''
        const completed = base + e.name + (e.type === 'directory' ? '/' : '')
        return beforePartial + completed
      })
  }, [fs, cwd])

  const prompt = `${user?.username || 'guest'}@retroos:${cwd}$`

  return (
    <div className="terminal-app">
      <TerminalView
        history={history}
        prompt={prompt}
        onCommand={handleCommand}
        getCompletions={getCompletions}
      />
    </div>
  )
}

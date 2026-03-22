import { useState, useCallback, useRef } from 'react'
import { useFileSystem } from '../../context/FileSystemContext'
import { useWindowManager } from '../../context/WindowManagerContext'
import { useOllama } from './useOllama'
import { buildSystemPrompt, REALMS } from './systemPrompt'
import MainMenu from './MainMenu'
import GameScreen from './GameScreen'
import PastAdventures from './PastAdventures'
import './RealmsOfAdventure.css'

function buildTranscript(allMessages, realmLabel, startTime, isComplete) {
  const header = [
    '========================================',
    `  REALMS OF ADVENTURE - ${realmLabel}`,
    `  Date: ${startTime.toLocaleDateString()} ${startTime.toLocaleTimeString()}`,
    isComplete ? '  Status: Complete' : '  Status: In Progress',
    '========================================',
    '',
  ].join('\n')

  const body = allMessages
    .filter((m, i) => {
      if (m.role === 'system') return false
      if (i === 1 && m.role === 'user' && m.content === 'Begin the adventure.') return false
      return true
    })
    .map(m => {
      const label = m.role === 'assistant' ? '[Game Master]' : '[Adventurer]'
      return `${label}\n${m.content}\n`
    })
    .join('\n')

  if (isComplete) {
    const footer = [
      '',
      '========================================',
      '  THE END',
      '========================================',
    ].join('\n')
    return header + body + footer
  }

  return header + body
}

export default function RealmsOfAdventure({ windowId }) {
  const { readDir, readFile, writeFile, createDir, exists } = useFileSystem()
  const { updateWindowTitle } = useWindowManager()
  const { chat, cancel } = useOllama()

  const [screen, setScreen] = useState('menu')
  const [messages, setMessages] = useState([])
  const [turnCount, setTurnCount] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedGames, setSavedGames] = useState([])
  const [readingContent, setReadingContent] = useState('')
  const [readingName, setReadingName] = useState('')
  const [currentRealm, setCurrentRealm] = useState(null)

  // Use refs for save file info so closures always have current values
  const savePathRef = useRef(null)
  const realmLabelRef = useRef('')
  const startTimeRef = useRef(null)

  function ensureGamesDir() {
    if (!exists('/Games')) {
      createDir('/Games')
    }
  }

  function saveTranscript(allMessages, isComplete) {
    if (!savePathRef.current) return
    const content = buildTranscript(allMessages, realmLabelRef.current, startTimeRef.current, isComplete)
    writeFile(savePathRef.current, content)
  }

  const startNewGame = useCallback(async (realmId, detailLevel) => {
    setError(null)
    setIsLoading(true)

    const systemPrompt = buildSystemPrompt(realmId, detailLevel)
    const realm = REALMS.find(r => r.id === realmId) || REALMS[0]

    // Kickoff message so the AI immediately starts narrating
    const initialMessages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Begin the adventure.' },
    ]

    try {
      const response = await chat(initialMessages)
      const allMessages = [...initialMessages, { role: 'assistant', content: response }]

      // Set up save file
      ensureGamesDir()
      const now = new Date()
      const dateStr = now.toISOString().slice(0, 16).replace('T', '_').replace(':', '-')
      const fileName = `${realm.name}_${dateStr}.txt`
      const filePath = `/Games/${fileName}`

      savePathRef.current = filePath
      realmLabelRef.current = realm.name
      startTimeRef.current = now

      setMessages(allMessages)
      setTurnCount(0)
      setGameOver(false)
      setCurrentRealm(realm)
      setScreen('game')
      updateWindowTitle(windowId, `Realms of Adventure — ${realm.name}`)

      // Save initial transcript
      const content = buildTranscript(allMessages, realm.name, now, false)
      writeFile(filePath, content)
    } catch (err) {
      if (err.name === 'AbortError') return
      setError('Could not connect to the Game Master. Make sure Ollama is running on localhost:11434.')
    } finally {
      setIsLoading(false)
    }
  }, [chat, updateWindowTitle, windowId, writeFile, exists, createDir])

  const sendMessage = useCallback(async (text) => {
    const userMessage = { role: 'user', content: text }
    const newTurn = turnCount + 1

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setTurnCount(newTurn)
    setIsLoading(true)

    // Save with user message immediately
    saveTranscript(updatedMessages, false)

    // Inject turn hint so the AI knows the pacing
    const messagesWithHint = [
      ...updatedMessages.slice(0, 1),
      { role: 'system', content: `[This is turn ${newTurn} of approximately 12-15. ${newTurn >= 10 ? 'Begin wrapping up the story now.' : ''} ${newTurn >= 13 ? 'Bring the adventure to its conclusion this turn or next.' : ''}]` },
      ...updatedMessages.slice(1),
    ]

    try {
      const response = await chat(messagesWithHint)
      const assistantMessage = { role: 'assistant', content: response }
      const allMessages = [...updatedMessages, assistantMessage]
      setMessages(allMessages)

      // Check for game end
      const isEnding = response.includes('THE END') && newTurn >= 10
      if (isEnding) {
        setGameOver(true)
        updateWindowTitle(windowId, 'Realms of Adventure — Quest Complete')
        saveTranscript(allMessages, true)
      } else {
        saveTranscript(allMessages, false)
      }
    } catch (err) {
      if (err.name === 'AbortError') return
      const errorMsg = {
        role: 'assistant',
        content: '*The connection wavers momentarily...* (Connection error — try your action again.)',
      }
      const allMessages = [...updatedMessages, errorMsg]
      setMessages(allMessages)
      saveTranscript(allMessages, false)
    } finally {
      setIsLoading(false)
    }
  }, [messages, turnCount, chat, updateWindowTitle, windowId, writeFile])

  const loadSavedGames = useCallback(() => {
    ensureGamesDir()
    const items = readDir('/Games')
    if (items) {
      const games = items
        .filter(item => item.type === 'file' && item.name.endsWith('.txt'))
        .sort((a, b) => b.name.localeCompare(a.name))
      setSavedGames(games.map(g => ({ name: g.name, path: `/Games/${g.name}` })))
    }
  }, [readDir, exists, createDir])

  const viewPast = useCallback(() => {
    loadSavedGames()
    setScreen('past')
    updateWindowTitle(windowId, 'Realms of Adventure — Past Adventures')
  }, [loadSavedGames, updateWindowTitle, windowId])

  const viewSavedGame = useCallback((game) => {
    const content = readFile(game.path)
    if (content !== null) {
      setReadingContent(content)
      setReadingName(game.name)
      setScreen('reading')
    }
  }, [readFile])

  const backToMenu = useCallback(() => {
    cancel()
    setIsLoading(false)
    setScreen('menu')
    setError(null)
    setCurrentRealm(null)
    savePathRef.current = null
    updateWindowTitle(windowId, 'Realms of Adventure')
  }, [cancel, updateWindowTitle, windowId])

  const backToList = useCallback(() => {
    setScreen('past')
    setReadingContent('')
    setReadingName('')
  }, [])

  if (screen === 'game') {
    return (
      <GameScreen
        messages={messages}
        turnCount={turnCount}
        gameOver={gameOver}
        isLoading={isLoading}
        onSendMessage={sendMessage}
        onBackToMenu={backToMenu}
        realmName={currentRealm?.name}
      />
    )
  }

  if (screen === 'past' || screen === 'reading') {
    return (
      <PastAdventures
        savedGames={savedGames}
        readingContent={readingContent}
        readingName={readingName}
        onSelectGame={viewSavedGame}
        onBack={screen === 'reading' ? backToList : backToMenu}
        screen={screen}
      />
    )
  }

  return (
    <MainMenu
      onNewGame={startNewGame}
      onViewPast={viewPast}
      isLoading={isLoading}
      error={error}
    />
  )
}

import { useCallback, useRef } from 'react'

const OLLAMA_URL = 'http://localhost:11434/api/chat'

export function useOllama() {
  const abortRef = useRef(null)

  const chat = useCallback(async (messages) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2',
        messages,
        stream: false,
      }),
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`)
    }

    const data = await response.json()
    abortRef.current = null
    return data.message.content
  }, [])

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
  }, [])

  return { chat, cancel }
}

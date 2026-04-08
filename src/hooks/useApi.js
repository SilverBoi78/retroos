import { useState, useCallback, useRef } from 'react'
import { API_BASE } from '../services/api'

export default function useApi() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const request = useCallback(async (endpoint, options = {}) => {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        const err = new Error(body.detail || `${response.status}: ${response.statusText}`)
        err.status = response.status
        throw err
      }

      const data = await response.json()
      setLoading(false)
      return data
    } catch (err) {
      if (err.name === 'AbortError') return null
      setError(err.message)
      setLoading(false)
      throw err
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    setLoading(false)
  }, [])

  return { request, loading, error, cancel }
}

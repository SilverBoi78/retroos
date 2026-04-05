import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './LoginScreen.css'

export default function LoginScreen() {
  const { login, register, authError } = useAuth()
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [sessionDuration, setSessionDuration] = useState('7d')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('Please enter a username.')
      return
    }
    if (!password.trim()) {
      setError('Please enter a password.')
      return
    }
    if (mode === 'register') {
      if (password.length < 4) {
        setError('Password must be at least 4 characters.')
        return
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'login') {
        await login(username.trim(), password, sessionDuration)
      } else {
        await register(username.trim(), password)
      }
    } catch {
      // authError is set by the context
    } finally {
      setSubmitting(false)
    }
  }

  function toggleMode() {
    setMode(mode === 'login' ? 'register' : 'login')
    setError('')
    setConfirmPassword('')
  }

  const displayError = error || authError

  return (
    <div className="login-screen">
      <div className="login-screen__content">
        <div className="login-screen__logo">
          <span className="login-screen__logo-icon">◈</span>
          <h1 className="login-screen__title">RetroOS</h1>
        </div>

        <div className="login-screen__dialog">
          <div className="login-screen__dialog-title">
            <span>{mode === 'login' ? 'Welcome to RetroOS' : 'Create Account'}</span>
          </div>
          <form className="login-screen__form" onSubmit={handleSubmit}>
            <div className="login-screen__field">
              <label className="login-screen__label" htmlFor="username">Username:</label>
              <input
                id="username"
                className="login-screen__input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                disabled={submitting}
              />
            </div>
            <div className="login-screen__field">
              <label className="login-screen__label" htmlFor="password">Password:</label>
              <input
                id="password"
                className="login-screen__input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                disabled={submitting}
              />
            </div>
            {mode === 'register' && (
              <div className="login-screen__field">
                <label className="login-screen__label" htmlFor="confirm-password">Confirm Password:</label>
                <input
                  id="confirm-password"
                  className="login-screen__input"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  disabled={submitting}
                />
              </div>
            )}
            {mode === 'login' && (
              <div className="login-screen__field">
                <label className="login-screen__label" htmlFor="session-duration">Remember me:</label>
                <select
                  id="session-duration"
                  className="login-screen__select"
                  value={sessionDuration}
                  onChange={(e) => setSessionDuration(e.target.value)}
                  disabled={submitting}
                >
                  <option value="session">This session only</option>
                  <option value="7d">For 7 days</option>
                  <option value="30d">For 30 days</option>
                  <option value="never">Indefinitely</option>
                </select>
              </div>
            )}
            {displayError && <div className="login-screen__error">{displayError}</div>}
            <div className="login-screen__actions">
              <button
                className="login-screen__btn"
                type="submit"
                disabled={submitting}
              >
                {submitting ? '...' : mode === 'login' ? 'Log In' : 'Register'}
              </button>
            </div>
            <div className="login-screen__toggle">
              <button type="button" className="login-screen__toggle-btn" onClick={toggleMode} disabled={submitting}>
                {mode === 'login' ? 'Create an account' : 'Already have an account? Log in'}
              </button>
            </div>
          </form>
        </div>

        <p className="login-screen__version">RetroOS v0.1.0</p>
      </div>
    </div>
  )
}

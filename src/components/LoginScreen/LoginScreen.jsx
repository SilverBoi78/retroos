import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import './LoginScreen.css'

export default function LoginScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
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

    // TODO: Replace with real backend authentication
    login(username.trim())
  }

  return (
    <div className="login-screen">
      <div className="login-screen__content">
        <div className="login-screen__logo">
          <span className="login-screen__logo-icon">◈</span>
          <h1 className="login-screen__title">RetroOS</h1>
        </div>

        <div className="login-screen__dialog">
          <div className="login-screen__dialog-title">
            <span>Welcome to RetroOS</span>
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
                autoComplete="current-password"
              />
            </div>
            {error && <div className="login-screen__error">{error}</div>}
            <div className="login-screen__actions">
              <button className="login-screen__btn" type="submit">Log In</button>
            </div>
          </form>
        </div>

        <p className="login-screen__version">RetroOS v0.1.0</p>
      </div>
    </div>
  )
}

import { useState, useCallback } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { WindowManagerProvider } from './context/WindowManagerContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FileSystemProvider } from './context/FileSystemContext'
import { NotificationProvider } from './context/NotificationContext'
import { ContextMenuProvider } from './context/ContextMenuContext'
import Desktop from './components/Desktop/Desktop'
import LoginScreen from './components/LoginScreen/LoginScreen'
import BootScreen from './components/BootScreen/BootScreen'

function AppContent() {
  const { isAuthenticated, loading } = useAuth()
  const [booted, setBooted] = useState(() => sessionStorage.getItem('retroos-booted') === 'true')

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem('retroos-booted', 'true')
    setBooted(true)
  }, [])

  if (!booted) {
    return <BootScreen onComplete={handleBootComplete} />
  }

  // Wait for session check before showing login
  if (loading) {
    return null
  }

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <FileSystemProvider>
      <WindowManagerProvider>
        <NotificationProvider>
          <ContextMenuProvider>
            <Desktop />
          </ContextMenuProvider>
        </NotificationProvider>
      </WindowManagerProvider>
    </FileSystemProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App

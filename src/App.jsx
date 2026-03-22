import { ThemeProvider } from './context/ThemeContext'
import { WindowManagerProvider } from './context/WindowManagerContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { FileSystemProvider } from './context/FileSystemContext'
import Desktop from './components/Desktop/Desktop'
import LoginScreen from './components/LoginScreen/LoginScreen'

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginScreen />
  }

  return (
    <FileSystemProvider>
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </FileSystemProvider>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

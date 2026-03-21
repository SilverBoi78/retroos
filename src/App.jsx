import { ThemeProvider } from './context/ThemeContext'
import { WindowManagerProvider } from './context/WindowManagerContext'
import Desktop from './components/Desktop/Desktop'

function App() {
  return (
    <ThemeProvider>
      <WindowManagerProvider>
        <Desktop />
      </WindowManagerProvider>
    </ThemeProvider>
  )
}

export default App

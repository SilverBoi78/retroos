import Calculator from '../apps/Calculator/Calculator'
import Notepad from '../apps/Notepad/Notepad'

const appRegistry = [
  {
    id: 'calculator',
    title: 'Calculator',
    icon: 'calculator',
    component: Calculator,
    defaultSize: { width: 320, height: 460 },
    allowMultiple: false,
  },
  {
    id: 'notepad',
    title: 'Notepad',
    icon: 'notepad',
    component: Notepad,
    defaultSize: { width: 540, height: 420 },
    allowMultiple: true,
  },
]

export default appRegistry

export function getApp(appId) {
  return appRegistry.find(app => app.id === appId)
}

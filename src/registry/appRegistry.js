import Calculator from '../apps/Calculator/Calculator'
import Notepad from '../apps/Notepad/Notepad'
import FileManager from '../apps/FileManager/FileManager'
import RealmsOfAdventure from '../apps/RealmsOfAdventure/RealmsOfAdventure'
import Personalization from '../apps/Personalization/Personalization'

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
  {
    id: 'filemanager',
    title: 'File Manager',
    icon: 'filemanager',
    component: FileManager,
    defaultSize: { width: 520, height: 400 },
    allowMultiple: true,
  },
  {
    id: 'realms',
    title: 'Realms of Adventure',
    icon: 'realms',
    component: RealmsOfAdventure,
    defaultSize: { width: 560, height: 480 },
    allowMultiple: false,
  },
  {
    id: 'personalization',
    title: 'Personalization',
    icon: 'personalization',
    component: Personalization,
    defaultSize: { width: 440, height: 360 },
    allowMultiple: false,
    systemApp: true,
  },
]

export default appRegistry

export function getApp(appId) {
  return appRegistry.find(app => app.id === appId)
}

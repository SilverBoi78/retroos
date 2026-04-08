import Calculator from '../apps/Calculator/Calculator'
import Notepad from '../apps/Notepad/Notepad'
import FileManager from '../apps/FileManager/FileManager'
import RealmsOfAdventure from '../apps/RealmsOfAdventure/RealmsOfAdventure'
import Personalization from '../apps/Personalization/Personalization'
import Terminal from '../apps/Terminal/Terminal'
import Minesweeper from '../apps/Minesweeper/Minesweeper'
import ArcadeCabinet from '../apps/ArcadeCabinet/ArcadeCabinet'
import HackingSim from '../apps/HackingSim/HackingSim'
import PixelStudio from '../apps/PixelStudio/PixelStudio'
import ChiptuneMaker from '../apps/ChiptuneMaker/ChiptuneMaker'
import Radio from '../apps/Radio/Radio'

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
    defaultSize: { width: 480, height: 460 },
    allowMultiple: false,
    systemApp: true,
  },
  {
    id: 'terminal',
    title: 'Terminal',
    icon: 'terminal',
    component: Terminal,
    defaultSize: { width: 560, height: 380 },
    allowMultiple: true,
  },
  {
    id: 'minesweeper',
    title: 'Minesweeper',
    icon: 'minesweeper',
    component: Minesweeper,
    defaultSize: { width: 280, height: 360 },
    allowMultiple: false,
  },
  {
    id: 'arcade',
    title: 'Arcade Cabinet',
    icon: 'arcade',
    component: ArcadeCabinet,
    defaultSize: { width: 480, height: 520 },
    allowMultiple: false,
  },
  {
    id: 'hackingsim',
    title: 'Hacking Simulator',
    icon: 'hackingsim',
    component: HackingSim,
    defaultSize: { width: 600, height: 440 },
    allowMultiple: false,
  },
  {
    id: 'pixelstudio',
    title: 'Pixel Studio',
    icon: 'pixelstudio',
    component: PixelStudio,
    defaultSize: { width: 640, height: 480 },
    allowMultiple: false,
  },
  {
    id: 'chiptune',
    title: 'Chiptune Maker',
    icon: 'chiptune',
    component: ChiptuneMaker,
    defaultSize: { width: 680, height: 460 },
    allowMultiple: false,
  },
  {
    id: 'radio',
    title: 'Radio',
    icon: 'radio',
    component: Radio,
    defaultSize: { width: 340, height: 380 },
    allowMultiple: false,
  },
]

export default appRegistry

export function getApp(appId) {
  return appRegistry.find(app => app.id === appId)
}

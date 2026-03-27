import { cipherLevels } from './cipher'
import { passwordLevels } from './password'
import { filesystemLevels } from './filesystem'
import { exploitLevels } from './exploit'

const allLevels = [
  ...cipherLevels,
  ...passwordLevels,
  ...filesystemLevels,
  ...exploitLevels,
]

export default allLevels

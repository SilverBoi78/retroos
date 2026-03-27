import { resolvePath, getParentPath } from '../../utils/pathUtils'

export function executeCommand(input, fs, cwd, auth) {
  const parts = input.trim().split(/\s+/)
  const cmd = parts[0].toLowerCase()
  const args = parts.slice(1)

  switch (cmd) {
    case 'ls': return cmdLs(args, fs, cwd)
    case 'cd': return cmdCd(args, fs, cwd)
    case 'cat': return cmdCat(args, fs, cwd)
    case 'mkdir': return cmdMkdir(args, fs, cwd)
    case 'rm': return cmdRm(args, fs, cwd)
    case 'touch': return cmdTouch(args, fs, cwd)
    case 'echo': return cmdEcho(args)
    case 'pwd': return { output: cwd }
    case 'whoami': return { output: auth?.user?.username || 'guest' }
    case 'date': return { output: new Date().toString() }
    case 'clear': return { clear: true }
    case 'help': return cmdHelp()
    case '': return { output: '' }
    default: return { output: `${cmd}: command not found. Type 'help' for available commands.`, type: 'error' }
  }
}

function cmdLs(args, fs, cwd) {
  const target = args[0] ? resolvePath(cwd, args[0]) : cwd
  const entries = fs.readDir(target)
  if (!entries) return { output: `ls: cannot access '${args[0] || target}': No such directory`, type: 'error' }
  if (entries.length === 0) return { output: '' }

  const lines = entries
    .sort((a, b) => {
      if (a.type !== b.type) return a.type === 'directory' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    .map(e => e.type === 'directory' ? `${e.name}/` : e.name)

  return { output: lines.join('\n') }
}

function cmdCd(args, fs, cwd) {
  if (args.length === 0 || args[0] === '~') return { newCwd: '/' }

  const target = resolvePath(cwd, args[0])
  const nodeType = fs.getNodeType(target)

  if (!nodeType) return { output: `cd: ${args[0]}: No such directory`, type: 'error' }
  if (nodeType !== 'directory') return { output: `cd: ${args[0]}: Not a directory`, type: 'error' }

  return { newCwd: target }
}

function cmdCat(args, fs, cwd) {
  if (args.length === 0) return { output: 'cat: missing file operand', type: 'error' }

  const target = resolvePath(cwd, args[0])
  const nodeType = fs.getNodeType(target)

  if (!nodeType) return { output: `cat: ${args[0]}: No such file`, type: 'error' }
  if (nodeType !== 'file') return { output: `cat: ${args[0]}: Is a directory`, type: 'error' }

  const content = fs.readFile(target)
  return { output: content || '' }
}

function cmdMkdir(args, fs, cwd) {
  if (args.length === 0) return { output: 'mkdir: missing directory name', type: 'error' }

  const target = resolvePath(cwd, args[0])
  const ok = fs.createDir(target)
  if (!ok) return { output: `mkdir: cannot create directory '${args[0]}': File exists or invalid path`, type: 'error' }
  return { output: '' }
}

function cmdRm(args, fs, cwd) {
  if (args.length === 0) return { output: 'rm: missing operand', type: 'error' }

  const target = resolvePath(cwd, args[0])
  if (target === '/') return { output: 'rm: cannot remove root directory', type: 'error' }

  const ok = fs.deleteNode(target)
  if (!ok) return { output: `rm: cannot remove '${args[0]}': No such file or directory`, type: 'error' }
  return { output: '' }
}

function cmdTouch(args, fs, cwd) {
  if (args.length === 0) return { output: 'touch: missing file operand', type: 'error' }

  const target = resolvePath(cwd, args[0])
  if (fs.exists(target)) return { output: '' }

  const ok = fs.writeFile(target, '')
  if (!ok) return { output: `touch: cannot create '${args[0]}': Invalid path`, type: 'error' }
  return { output: '' }
}

function cmdEcho(args) {
  return { output: args.join(' ') }
}

function cmdHelp() {
  const lines = [
    'Available commands:',
    '  ls [path]       List directory contents',
    '  cd <path>       Change directory',
    '  cat <file>      Display file contents',
    '  mkdir <name>    Create a directory',
    '  rm <path>       Remove a file or directory',
    '  touch <name>    Create an empty file',
    '  echo <text>     Display text',
    '  pwd             Print working directory',
    '  whoami          Display current user',
    '  date            Display current date and time',
    '  clear           Clear the terminal',
    '  help            Show this help message',
  ]
  return { output: lines.join('\n') }
}

const fakeFS = {
  '/': ['home/', 'var/', 'etc/', 'tmp/'],
  '/home': ['admin/', 'guest/'],
  '/home/admin': ['.ssh/', 'notes.txt', '.bash_history'],
  '/home/admin/.ssh': ['authorized_keys', 'id_rsa.pub'],
  '/home/guest': ['readme.txt'],
  '/var': ['log/', 'www/'],
  '/var/log': ['auth.log', 'system.log'],
  '/var/www': ['index.html'],
  '/etc': ['passwd', 'shadow', 'hosts'],
  '/tmp': ['session_1a2b.tmp'],
}

const fakeFiles = {
  '/home/admin/notes.txt': 'TODO: Change server password\nOld password was stored in /tmp\nNew password uses my employee ID (see /etc/passwd)',
  '/home/admin/.bash_history': 'ls\ncd /var/log\ncat auth.log\nssh root@192.168.1.1\npasswd\ncat /etc/passwd',
  '/home/admin/.ssh/authorized_keys': 'ssh-rsa AAAAB3... admin@server',
  '/home/admin/.ssh/id_rsa.pub': 'ssh-rsa AAAAB3... admin@server',
  '/home/guest/readme.txt': 'Welcome to the system. Guest accounts have limited access.',
  '/var/log/auth.log': 'Mar 15 09:22:01 Failed login for admin\nMar 15 09:22:05 Successful login for admin\nMar 15 10:45:22 Password changed for admin',
  '/var/log/system.log': 'System boot at 08:00:00\nAll services started\nBackup completed at 03:00:00',
  '/var/www/index.html': '<html><body>NexGen Corp Internal Portal</body></html>',
  '/etc/passwd': 'root:x:0:0:root:/root\nadmin:x:1001:1001:Admin User EMP-7734:/home/admin\nguest:x:1002:1002:Guest:/home/guest',
  '/etc/shadow': 'Permission denied: insufficient privileges',
  '/etc/hosts': '127.0.0.1 localhost\n192.168.1.1 mainserver\n192.168.1.50 database',
  '/tmp/session_1a2b.tmp': 'old_password=TEMP1234\nexpired=true\nnote=password reset required, use employee ID format: EMP-XXXX',
}

export const filesystemLevels = [
  {
    id: 5,
    name: 'File Hunter',
    type: 'filesystem',
    briefing: 'Navigate the target server\'s file system to find the admin password.\nUse standard commands: ls, cd, cat. Then login with what you find.',
    initialOutput: [
      { type: 'system', text: '[ CONNECTED TO: 192.168.1.1 ]' },
      { type: 'system', text: '[ Shell access obtained as guest ]' },
      { type: 'output', text: '' },
      { type: 'system', text: 'Commands: ls, cd <dir>, cat <file>, login <password>, hint' },
    ],
    createHandler() {
      let cwd = '/'
      const password = 'EMP-7734'

      return (cmd, args) => {
        if (cmd === 'ls') {
          const target = args[0] ? resolveFakePath(cwd, args[0]) : cwd
          const entries = fakeFS[target]
          if (!entries) return { output: `ls: cannot access '${args[0] || target}': No such directory`, type: 'error' }
          return { output: entries.join('\n') }
        }
        if (cmd === 'cd') {
          if (!args[0] || args[0] === '/') { cwd = '/'; return { output: '' } }
          const target = resolveFakePath(cwd, args[0])
          if (fakeFS[target]) { cwd = target; return { output: '' } }
          return { output: `cd: ${args[0]}: No such directory`, type: 'error' }
        }
        if (cmd === 'cat') {
          if (!args[0]) return { output: 'cat: missing file', type: 'error' }
          const target = resolveFakePath(cwd, args[0])
          if (fakeFiles[target]) return { output: fakeFiles[target] }
          return { output: `cat: ${args[0]}: No such file`, type: 'error' }
        }
        if (cmd === 'pwd') return { output: cwd }
        if (cmd === 'login') {
          if (args.join('-').toUpperCase() === password || args[0]?.toUpperCase() === password) {
            return { output: 'ACCESS GRANTED. Root access obtained.', type: 'success', solved: true }
          }
          return { output: 'ACCESS DENIED.', type: 'error' }
        }
        if (cmd === 'hint') {
          return { output: 'Start by reading the admin\'s notes. Follow the trail of clues through the filesystem.' }
        }
        return { output: `Unknown command: ${cmd}. Try: ls, cd, cat, login, hint`, type: 'error' }
      }
    },
  },
  {
    id: 6,
    name: 'Log Analysis',
    type: 'filesystem',
    briefing: 'The database server was breached. Analyze the logs to find the attacker\'s backdoor password.\nThe attacker left traces in the log files.',
    initialOutput: [
      { type: 'system', text: '[ FORENSIC ANALYSIS MODE ]' },
      { type: 'system', text: '[ Target: 192.168.1.50 (database) ]' },
      { type: 'output', text: '' },
      { type: 'system', text: 'Commands: ls, cd <dir>, cat <file>, search <term>, login <password>, hint' },
    ],
    createHandler() {
      const logFS = {
        '/': ['var/', 'home/', 'opt/'],
        '/var': ['log/'],
        '/var/log': ['access.log', 'error.log', 'audit.log'],
        '/home': ['dbadmin/'],
        '/home/dbadmin': ['.config/', 'backup.sh'],
        '/home/dbadmin/.config': ['creds.enc'],
        '/opt': ['backdoor/'],
        '/opt/backdoor': ['connect.sh', 'README'],
      }
      const logFiles = {
        '/var/log/access.log': '192.168.1.100 - GET /api/users 200\n192.168.1.100 - GET /api/admin 403\n10.0.0.99 - POST /api/admin 200\n10.0.0.99 - POST /upload 200',
        '/var/log/error.log': 'WARNING: Unauthorized access attempt from 10.0.0.99\nERROR: Unknown binary executed in /opt/backdoor\nWARNING: New cron job added by unknown user',
        '/var/log/audit.log': 'USER_CMD: mkdir /opt/backdoor\nUSER_CMD: echo "PHANTOM" > /opt/backdoor/connect.sh\nFILE_WRITE: /opt/backdoor/README created',
        '/home/dbadmin/backup.sh': '#!/bin/bash\nmysqldump -u root -p$DB_PASS > backup.sql',
        '/home/dbadmin/.config/creds.enc': '[ENCRYPTED] Cannot read without decryption key',
        '/opt/backdoor/connect.sh': '#!/bin/bash\n# Backdoor connection script\n# Password: PHANTOM\nnc -l -p 4444 -e /bin/sh',
        '/opt/backdoor/README': 'If you found this, the password is in connect.sh.\n- The Ghost',
      }

      let cwd = '/'
      const password = 'PHANTOM'

      return (cmd, args) => {
        if (cmd === 'ls') {
          const target = args[0] ? resolveFakePath(cwd, args[0]) : cwd
          const entries = logFS[target]
          if (!entries) return { output: `ls: cannot access: No such directory`, type: 'error' }
          return { output: entries.join('\n') }
        }
        if (cmd === 'cd') {
          if (!args[0] || args[0] === '/') { cwd = '/'; return { output: '' } }
          const target = resolveFakePath(cwd, args[0])
          if (logFS[target]) { cwd = target; return { output: '' } }
          return { output: `cd: No such directory`, type: 'error' }
        }
        if (cmd === 'cat') {
          if (!args[0]) return { output: 'cat: missing file', type: 'error' }
          const target = resolveFakePath(cwd, args[0])
          if (logFiles[target]) return { output: logFiles[target] }
          return { output: `cat: No such file`, type: 'error' }
        }
        if (cmd === 'pwd') return { output: cwd }
        if (cmd === 'search') {
          if (!args[0]) return { output: 'search: missing term', type: 'error' }
          const term = args[0].toLowerCase()
          const results = Object.entries(logFiles)
            .filter(([, content]) => content.toLowerCase().includes(term))
            .map(([path]) => path)
          if (results.length === 0) return { output: 'No matches found.' }
          return { output: 'Found in:\n' + results.join('\n') }
        }
        if (cmd === 'login') {
          if (args[0]?.toUpperCase() === password) {
            return { output: 'BACKDOOR ACCESS CONFIRMED. Investigation complete.', type: 'success', solved: true }
          }
          return { output: 'ACCESS DENIED.', type: 'error' }
        }
        if (cmd === 'hint') {
          return { output: 'Check the error.log for suspicious activity. Follow the trail to the backdoor directory.' }
        }
        return { output: `Unknown command: ${cmd}. Try: ls, cd, cat, search, login, hint`, type: 'error' }
      }
    },
  },
]

function resolveFakePath(cwd, input) {
  if (input.startsWith('/')) return input.replace(/\/$/, '') || '/'
  const parts = (cwd === '/' ? [] : cwd.split('/').filter(Boolean))
  for (const seg of input.split('/').filter(Boolean)) {
    if (seg === '..') parts.pop()
    else if (seg !== '.') parts.push(seg.replace(/\/$/, ''))
  }
  return '/' + parts.join('/') || '/'
}

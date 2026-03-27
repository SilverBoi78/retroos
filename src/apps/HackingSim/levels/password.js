export const passwordLevels = [
  {
    id: 3,
    name: 'Social Engineering',
    type: 'password',
    briefing: 'We need to access Dr. Morales\' account.\nUse examine and hint commands to gather clues. You have 5 attempts.',
    initialOutput: [
      { type: 'system', text: '[ TARGET: Dr. Elena Morales ]' },
      { type: 'system', text: '[ Account: e.morales@nexgen-corp.com ]' },
      { type: 'output', text: '' },
      { type: 'output', text: 'Dossier loaded. Use "examine" to inspect items.' },
      { type: 'system', text: 'Commands: examine <item>, login <password>, hint' },
      { type: 'system', text: 'Items: desk, photo, calendar, notes, computer' },
    ],
    createHandler() {
      const password = 'LUNA2019'
      let attempts = 5
      return (cmd, args) => {
        if (cmd === 'examine') {
          const item = args[0]?.toLowerCase()
          if (item === 'desk') return { output: 'A tidy desk. Name plate reads "Dr. Elena Morales". A small cat figurine sits next to the monitor.' }
          if (item === 'photo') return { output: 'A framed photo of Dr. Morales with a gray cat. Written on the back: "Luna, adopted June 2019"' }
          if (item === 'calendar') return { output: 'Wall calendar showing research deadlines. Nothing personal noted.' }
          if (item === 'notes') return { output: 'Post-it notes with meeting reminders. One reads: "Remember to change passwords — combine pet name + year!"' }
          if (item === 'computer') return { output: 'Login screen showing e.morales@nexgen-corp.com. Password field is empty.' }
          return { output: 'Nothing to examine by that name. Try: desk, photo, calendar, notes, computer', type: 'error' }
        }
        if (cmd === 'login') {
          attempts--
          if (args.join('').toUpperCase() === password) {
            return { output: 'ACCESS GRANTED. Welcome, Dr. Morales.', type: 'success', solved: true }
          }
          if (attempts <= 0) {
            return { output: 'ACCOUNT LOCKED. Too many failed attempts.', type: 'error', failed: true }
          }
          return { output: `ACCESS DENIED. ${attempts} attempt(s) remaining.`, type: 'error' }
        }
        if (cmd === 'hint') {
          return { output: 'Check the photo and the notes. People often use personal details in passwords.' }
        }
        return { output: `Unknown command: ${cmd}`, type: 'error' }
      }
    },
  },
  {
    id: 4,
    name: 'The Keymaker',
    type: 'password',
    briefing: 'A server admin uses a pattern-based password. Analyze the clues to figure out the pattern.\nYou have 4 attempts.',
    initialOutput: [
      { type: 'system', text: '[ TARGET: Admin Server Panel ]' },
      { type: 'output', text: '' },
      { type: 'output', text: 'Recovered from old backups:' },
      { type: 'output', text: '  Jan password: ADMIN-JAN-31' },
      { type: 'output', text: '  Feb password: ADMIN-FEB-28' },
      { type: 'output', text: '  Current month: March' },
      { type: 'output', text: '' },
      { type: 'system', text: 'Commands: login <password>, hint, analyze' },
    ],
    createHandler() {
      const password = 'ADMIN-MAR-31'
      let attempts = 4
      return (cmd, args) => {
        if (cmd === 'login') {
          attempts--
          if (args.join('').toUpperCase() === password) {
            return { output: 'ACCESS GRANTED. Admin panel unlocked.', type: 'success', solved: true }
          }
          if (attempts <= 0) {
            return { output: 'LOCKOUT TRIGGERED. Intrusion detected.', type: 'error', failed: true }
          }
          return { output: `ACCESS DENIED. ${attempts} attempt(s) remaining.`, type: 'error' }
        }
        if (cmd === 'analyze') {
          return { output: 'Pattern: ADMIN-{MONTH_ABBREV}-{DAYS_IN_MONTH}\nJanuary has 31 days, February has 28. What about March?' }
        }
        if (cmd === 'hint') {
          return { output: 'The password follows a pattern: ADMIN-[3-letter month]-[days in that month].' }
        }
        return { output: `Unknown command: ${cmd}`, type: 'error' }
      }
    },
  },
]

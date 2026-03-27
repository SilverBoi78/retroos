function rot13(str) {
  return str.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
  })
}

export const cipherLevels = [
  {
    id: 1,
    name: 'First Contact',
    type: 'cipher',
    briefing: 'We intercepted an encoded transmission. The message uses ROT13 encryption.\nDecode it to find the access password, then use: login <password>',
    initialOutput: [
      { type: 'system', text: '[ INTERCEPTED TRANSMISSION ]' },
      { type: 'output', text: '' },
      { type: 'output', text: 'Rapbqrq zrffntr: Gur cnffjbeq vf FUNQBJ' },
      { type: 'output', text: '' },
      { type: 'system', text: 'Available commands: decode rot13 <text>, login <password>, hint' },
    ],
    createHandler() {
      const password = 'SHADOW'
      let attempts = 0
      return (cmd, args) => {
        if (cmd === 'decode' && args[0] === 'rot13') {
          const text = args.slice(1).join(' ')
          if (!text) return { output: 'Usage: decode rot13 <text>', type: 'error' }
          return { output: rot13(text) }
        }
        if (cmd === 'login') {
          attempts++
          if (args[0]?.toUpperCase() === password) {
            return { output: 'ACCESS GRANTED. System compromised.', type: 'success', solved: true }
          }
          return { output: `ACCESS DENIED. (Attempt ${attempts})`, type: 'error' }
        }
        if (cmd === 'hint') {
          return { output: 'ROT13 shifts each letter by 13 positions. Try: decode rot13 Gur cnffjbeq vf FUNQBJ' }
        }
        return { output: `Unknown command: ${cmd}. Try: decode, login, hint`, type: 'error' }
      }
    },
  },
  {
    id: 2,
    name: 'Double Encoded',
    type: 'cipher',
    briefing: 'This message was encoded twice — first reversed, then ROT13.\nYou need to decode both layers. Password format: a single word.',
    initialOutput: [
      { type: 'system', text: '[ ENCRYPTED MESSAGE ]' },
      { type: 'output', text: '' },
      { type: 'output', text: 'ABKVE :fv qebJffnc rUg' },
      { type: 'output', text: '' },
      { type: 'system', text: 'Commands: decode rot13 <text>, decode reverse <text>, login <password>, hint' },
    ],
    createHandler() {
      const password = 'VIXEN'
      let attempts = 0
      return (cmd, args) => {
        if (cmd === 'decode' && args[0] === 'rot13') {
          const text = args.slice(1).join(' ')
          if (!text) return { output: 'Usage: decode rot13 <text>', type: 'error' }
          return { output: rot13(text) }
        }
        if (cmd === 'decode' && args[0] === 'reverse') {
          const text = args.slice(1).join(' ')
          if (!text) return { output: 'Usage: decode reverse <text>', type: 'error' }
          return { output: text.split('').reverse().join('') }
        }
        if (cmd === 'login') {
          attempts++
          if (args[0]?.toUpperCase() === password) {
            return { output: 'ACCESS GRANTED. Encryption bypassed.', type: 'success', solved: true }
          }
          return { output: `ACCESS DENIED. (Attempt ${attempts})`, type: 'error' }
        }
        if (cmd === 'hint') {
          return { output: 'Try reversing the message first, then applying ROT13 to the result.' }
        }
        return { output: `Unknown command: ${cmd}`, type: 'error' }
      }
    },
  },
]

let sharedContext = null

export function getAudioContext() {
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new (window.AudioContext || window.webkitAudioContext)()
  }
  return sharedContext
}

export function tone(ctx, master, { freq, duration = 0.15, type = 'square', attack = 0.005, release = 0.05, volume = 0.3 }) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, now)
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(volume, now + attack)
  gain.gain.linearRampToValueAtTime(volume * 0.7, now + duration - release)
  gain.gain.linearRampToValueAtTime(0, now + duration)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function sweep(ctx, master, { from, to, duration = 0.2, type = 'square', volume = 0.25 }) {
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(from, now)
  osc.frequency.exponentialRampToValueAtTime(Math.max(to, 1), now + duration)
  gain.gain.setValueAtTime(volume, now)
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + duration + 0.02)
}

export function chord(ctx, master, freqs, { duration = 0.25, type = 'sine', volume = 0.18 } = {}) {
  for (const freq of freqs) {
    tone(ctx, master, { freq, duration, type, volume })
  }
}

export function sequence(ctx, master, notes, { type = 'square', noteDuration = 0.1, volume = 0.25, gap = 0.02 } = {}) {
  let offset = 0
  for (const freq of notes) {
    setTimeout(() => tone(ctx, master, { freq, duration: noteDuration, type, volume }), offset)
    offset += (noteDuration + gap) * 1000
  }
}

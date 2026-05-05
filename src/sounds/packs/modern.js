import { tone, chord, sequence } from '../synth'

export default {
  id: 'modern',
  name: 'Modern',
  description: 'Smooth sine chimes with longer release.',
  events: {
    windowOpen: (ctx, master) => chord(ctx, master, [523, 659], { duration: 0.18, type: 'sine', volume: 0.16 }),
    windowClose: (ctx, master) => chord(ctx, master, [392, 329], { duration: 0.18, type: 'sine', volume: 0.16 }),
    windowMinimize: (ctx, master) => tone(ctx, master, { freq: 392, duration: 0.12, type: 'sine', volume: 0.15 }),
    windowMaximize: (ctx, master) => tone(ctx, master, { freq: 659, duration: 0.12, type: 'sine', volume: 0.15 }),
    notification: (ctx, master) => {
      tone(ctx, master, { freq: 880, duration: 0.18, type: 'sine', volume: 0.16, release: 0.12 })
      setTimeout(() => tone(ctx, master, { freq: 1318, duration: 0.22, type: 'sine', volume: 0.14, release: 0.16 }), 100)
    },
    login: (ctx, master) => sequence(ctx, master, [523, 783, 1046], { type: 'sine', noteDuration: 0.16, volume: 0.18, gap: 0.04 }),
    logout: (ctx, master) => sequence(ctx, master, [1046, 783, 523], { type: 'sine', noteDuration: 0.16, volume: 0.18, gap: 0.04 }),
    startup: (ctx, master) => sequence(ctx, master, [392, 523, 659, 1046], { type: 'sine', noteDuration: 0.2, volume: 0.2, gap: 0.05 }),
    error: (ctx, master) => {
      tone(ctx, master, { freq: 220, duration: 0.2, type: 'triangle', volume: 0.2 })
      setTimeout(() => tone(ctx, master, { freq: 196, duration: 0.25, type: 'triangle', volume: 0.18 }), 120)
    },
    success: (ctx, master) => chord(ctx, master, [523, 659, 784], { duration: 0.3, type: 'sine', volume: 0.15 }),
  },
}

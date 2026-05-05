import { tone, sweep, sequence } from '../synth'

export default {
  id: 'retro',
  name: 'Retro Beep',
  description: 'Chiptune-style square waves and bleeps.',
  events: {
    windowOpen: (ctx, master) => sweep(ctx, master, { from: 220, to: 660, duration: 0.12, type: 'square', volume: 0.2 }),
    windowClose: (ctx, master) => sweep(ctx, master, { from: 660, to: 220, duration: 0.12, type: 'square', volume: 0.2 }),
    windowMinimize: (ctx, master) => sweep(ctx, master, { from: 440, to: 180, duration: 0.1, type: 'square', volume: 0.15 }),
    windowMaximize: (ctx, master) => sweep(ctx, master, { from: 300, to: 750, duration: 0.1, type: 'square', volume: 0.15 }),
    notification: (ctx, master) => {
      tone(ctx, master, { freq: 880, duration: 0.07, type: 'square', volume: 0.18 })
      setTimeout(() => tone(ctx, master, { freq: 1175, duration: 0.1, type: 'square', volume: 0.18 }), 80)
    },
    login: (ctx, master) => sequence(ctx, master, [523, 659, 784, 1046], { type: 'square', noteDuration: 0.09, volume: 0.22 }),
    logout: (ctx, master) => sequence(ctx, master, [784, 659, 523], { type: 'square', noteDuration: 0.1, volume: 0.22 }),
    startup: (ctx, master) => sequence(ctx, master, [261, 392, 523, 784, 1046], { type: 'square', noteDuration: 0.13, volume: 0.25 }),
    error: (ctx, master) => sweep(ctx, master, { from: 220, to: 110, duration: 0.25, type: 'sawtooth', volume: 0.22 }),
    success: (ctx, master) => sequence(ctx, master, [659, 784, 988], { type: 'square', noteDuration: 0.07, volume: 0.2 }),
  },
}

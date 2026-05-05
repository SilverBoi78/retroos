import { getAudioContext } from './synth'
import retro from './packs/retro'
import modern from './packs/modern'
import silent from './packs/silent'

const PACKS = { retro, modern, silent }

export const PACK_LIST = [retro, modern, silent]

let config = {
  enabled: true,
  packId: 'retro',
  volume: 0.5,
  events: {
    windowOpen: true,
    windowClose: true,
    windowMinimize: true,
    windowMaximize: true,
    notification: true,
    login: true,
    startup: true,
  },
}

let masterGain = null

function ensureMaster(ctx) {
  if (!masterGain || masterGain.context !== ctx) {
    masterGain = ctx.createGain()
    masterGain.connect(ctx.destination)
  }
  masterGain.gain.value = config.volume
  return masterGain
}

export function setSoundConfig(next) {
  config = { ...config, ...next }
  if (masterGain) masterGain.gain.value = config.volume
}

export function getPack(id) {
  return PACKS[id] || retro
}

export function play(eventName, { force = false } = {}) {
  if (!config.enabled && !force) return
  if (!force && config.events && config.events[eventName] === false) return
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const pack = getPack(config.packId)
    const fn = pack.events[eventName]
    if (typeof fn === 'function') {
      fn(ctx, ensureMaster(ctx))
    }
  } catch {
    return
  }
}

export function previewPack(packId) {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  const pack = getPack(packId)
  const master = ensureMaster(ctx)
  pack.events.windowOpen?.(ctx, master)
  setTimeout(() => pack.events.notification?.(ctx, master), 350)
  setTimeout(() => pack.events.windowClose?.(ctx, master), 800)
}

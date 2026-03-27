const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

// Generate frequencies: A4 = 440Hz, equal temperament
// MIDI note 69 = A4
export const NOTE_FREQUENCIES = {}

for (let octave = 2; octave <= 6; octave++) {
  for (let i = 0; i < NOTE_NAMES.length; i++) {
    const noteName = `${NOTE_NAMES[i]}${octave}`
    const midiNote = (octave + 1) * 12 + i
    NOTE_FREQUENCIES[noteName] = 440 * Math.pow(2, (midiNote - 69) / 12)
  }
}

export { NOTE_NAMES }

export function playNote(audioCtx, frequency, waveform, startTime, duration, volume = 0.5) {
  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = waveform
  osc.frequency.setValueAtTime(frequency, startTime)

  // ADSR envelope
  gain.gain.setValueAtTime(0, startTime)
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.01)
  gain.gain.linearRampToValueAtTime(volume * 0.6, startTime + 0.05)
  gain.gain.setValueAtTime(volume * 0.6, startTime + duration - 0.05)
  gain.gain.linearRampToValueAtTime(0, startTime + duration)

  osc.connect(gain)
  gain.connect(audioCtx.destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

export function createADSR(audioCtx, gainNode, attack, decay, sustain, release, startTime, duration) {
  gainNode.gain.setValueAtTime(0, startTime)
  gainNode.gain.linearRampToValueAtTime(1, startTime + attack)
  gainNode.gain.linearRampToValueAtTime(sustain, startTime + attack + decay)
  gainNode.gain.setValueAtTime(sustain, startTime + duration - release)
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration)
}

export function createNoiseBuffer(audioCtx, duration = 2) {
  const bufferSize = audioCtx.sampleRate * duration
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

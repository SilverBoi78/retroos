const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const frequencies = {}
const noteList = []

for (let octave = 2; octave <= 5; octave++) {
  for (let i = 0; i < NOTE_NAMES.length; i++) {
    const name = `${NOTE_NAMES[i]}${octave}`
    const midi = (octave + 1) * 12 + i
    frequencies[name] = 440 * Math.pow(2, (midi - 69) / 12)
    noteList.push(name)
  }
}

export { NOTE_NAMES }
export default frequencies
export { noteList }

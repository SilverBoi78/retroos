// 16x16 retro pixel cursor (arrow pointer)
const RETRO_CURSOR = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAA3klEQVQ4T6WTuw3CQBBE3wgJUeAOqIASSqADx0ROSIiJCZwQUwIlUAEd0AESsRHStbS6O+8ZS5Z8uzs7M/tZiyL98NUVpdTlHo+2WKkBa+ABuAJj4AKcIwErYA+cYvEBWAInDYAdsImcacJbIB8LWAIDlW9O5wrYqQFxHfPAAJgBRaAPwAw4awPiOqYR8jDN0TWMRKCHIjATrg0YA2i2fOsCQqDfwgAYAKKVZ2x3Xjb8v8SQOMwUwFfYKXe4aWwv7AK7+JkC/gs6cNfCHb2FGXmKMwL0xK//CWx8OdNn+wL7fHI5BHBKAAAAABJRU5ErkJggg==") 0 0, auto`

// 16x16 retro pixel hand/pointer cursor
const RETRO_POINTER = `url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAxklEQVQ4T62T0Q2AIAxEewcndQZHcAb3cFRncFInMD+kKaW0YkJC4Oj1rgWp+FFqfnkGAJjMPZj5tn9IYmYHmLn7sgMLvnAySc4C4OoqK+7sSJoBewCnmNgDWZKqjYgL4BBFkhVF8o0FJKkBIg98yRqQA1gCW2+BPuiTNSAF4I8ZKa1BncLMfMi6JNQBr5QmHqDfwkhgzYseGQgT9hIAwO4ARl+s7LFB/8TE3Gw3PijkAbcpvCH2cFFeYYz0ubAZ6T/E9wTe3Y+yboUwDkAAAAASUVORK5CYII=") 6 0, pointer`

export const cursorPresets = [
  {
    id: 'default',
    name: 'Default',
    cursors: { default: 'default', pointer: 'pointer' },
  },
  {
    id: 'retro',
    name: 'Retro Pixel',
    cursors: { default: RETRO_CURSOR, pointer: RETRO_POINTER },
  },
  {
    id: 'crosshair',
    name: 'Crosshair',
    cursors: { default: 'crosshair', pointer: 'pointer' },
  },
]

export function getCursorPreset(id) {
  return cursorPresets.find(p => p.id === id) || cursorPresets[0]
}

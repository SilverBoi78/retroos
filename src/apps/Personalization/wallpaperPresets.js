export const gradients = [
  { id: 'sunset', name: 'Sunset', css: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)' },
  { id: 'ocean', name: 'Ocean', css: 'linear-gradient(135deg, #1a2980 0%, #26d0ce 100%)' },
  { id: 'forest', name: 'Forest', css: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)' },
  { id: 'nightsky', name: 'Night Sky', css: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { id: 'aurora', name: 'Aurora', css: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 50%, #fa709a 100%)' },
  { id: 'storm', name: 'Storm', css: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { id: 'peach', name: 'Peach', css: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { id: 'slate', name: 'Slate', css: 'linear-gradient(135deg, #2c3e50 0%, #4ca1af 100%)' },
  { id: 'ember', name: 'Ember', css: 'linear-gradient(135deg, #cb2d3e 0%, #ef473a 100%)' },
  { id: 'lavender', name: 'Lavender', css: 'linear-gradient(135deg, #c471f5 0%, #fa71cd 100%)' },
  { id: 'midnight', name: 'Midnight', css: 'linear-gradient(135deg, #232526 0%, #414345 100%)' },
  { id: 'moss', name: 'Moss', css: 'linear-gradient(135deg, #3a6b35 0%, #88c070 100%)' },
]

export const patterns = [
  {
    id: 'dots',
    name: 'Dots',
    css: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
    size: '16px 16px',
    bg: '#2c5f6e',
  },
  {
    id: 'grid',
    name: 'Grid',
    css: 'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
    size: '24px 24px',
    bg: '#1a2332',
  },
  {
    id: 'diagonal',
    name: 'Diagonal',
    css: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.05) 8px, rgba(255,255,255,0.05) 16px)',
    bg: '#3a4a5a',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    css: 'linear-gradient(27deg, #151515 5px, transparent 5px) 0 5px, linear-gradient(207deg, #151515 5px, transparent 5px) 10px 0, linear-gradient(27deg, #222 5px, transparent 5px) 0 10px, linear-gradient(207deg, #222 5px, transparent 5px) 10px 5px, linear-gradient(90deg, #1b1b1b 10px, transparent 10px), linear-gradient(#1d1d1d 25%, #1a1a1a 25%, #1a1a1a 50%, transparent 50%, transparent 75%, #242424 75%, #242424)',
    size: '20px 20px',
    bg: '#282828',
  },
  {
    id: 'checkerboard',
    name: 'Checker',
    css: 'linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%), linear-gradient(45deg, rgba(255,255,255,0.05) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.05) 75%)',
    size: '32px 32px',
    position: '0 0, 16px 16px',
    bg: '#2a3a4a',
  },
  {
    id: 'waves',
    name: 'Waves',
    css: 'radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.08) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(255,255,255,0.04) 0%, transparent 60%)',
    bg: '#1e3a5f',
  },
]

export function getPresetCSS(preset) {
  if (!preset) return {}

  // It's a gradient
  if (preset.bg === undefined && !preset.size) {
    return { background: preset.css }
  }

  // It's a pattern
  const style = { background: `${preset.css}`, backgroundColor: preset.bg }
  if (preset.size) style.backgroundSize = preset.size
  if (preset.position) style.backgroundPosition = preset.position
  return style
}

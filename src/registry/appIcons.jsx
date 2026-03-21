export const appIcons = {
  calculator: (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="2" width="24" height="28" rx="1" fill="#c8c0b8" stroke="#58585a" strokeWidth="1"/>
      <rect x="6" y="4" width="20" height="7" fill="#2a2a3a"/>
      <text x="24" y="10" fill="#60d860" fontSize="7" fontFamily="monospace" textAnchor="end">0</text>
      <rect x="7" y="13" width="4" height="3" rx="0.5" fill="#dcd4cc" stroke="#98988a" strokeWidth="0.5"/>
      <rect x="13" y="13" width="4" height="3" rx="0.5" fill="#dcd4cc" stroke="#98988a" strokeWidth="0.5"/>
      <rect x="19" y="13" width="4" height="3" rx="0.5" fill="#dcd4cc" stroke="#98988a" strokeWidth="0.5"/>
      <rect x="7" y="18" width="4" height="3" rx="0.5" fill="#dcd4cc" stroke="#98988a" strokeWidth="0.5"/>
      <rect x="13" y="18" width="4" height="3" rx="0.5" fill="#dcd4cc" stroke="#98988a" strokeWidth="0.5"/>
      <rect x="19" y="18" width="4" height="3" rx="0.5" fill="#dcd4cc" stroke="#98988a" strokeWidth="0.5"/>
      <rect x="7" y="23" width="4" height="3" rx="0.5" fill="#dcd4cc" stroke="#98988a" strokeWidth="0.5"/>
      <rect x="13" y="23" width="4" height="3" rx="0.5" fill="#dcd4cc" stroke="#98988a" strokeWidth="0.5"/>
      <rect x="19" y="23" width="4" height="3" rx="0.5" fill="#6a5a8a" stroke="#98988a" strokeWidth="0.5"/>
    </svg>
  ),
  notepad: (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="2" width="20" height="28" fill="#fffff0" stroke="#58585a" strokeWidth="1"/>
      <rect x="6" y="2" width="20" height="4" fill="#6a5a8a"/>
      <line x1="9" y1="10" x2="23" y2="10" stroke="#c0c0b0" strokeWidth="0.5"/>
      <line x1="9" y1="14" x2="21" y2="14" stroke="#c0c0b0" strokeWidth="0.5"/>
      <line x1="9" y1="18" x2="22" y2="18" stroke="#c0c0b0" strokeWidth="0.5"/>
      <line x1="9" y1="22" x2="18" y2="22" stroke="#c0c0b0" strokeWidth="0.5"/>
      <text x="10" y="10" fill="#2a2a3a" fontSize="4" fontFamily="monospace">Abc</text>
      <rect x="3" y="4" width="4" height="3" fill="#e8c840" stroke="#a0983a" strokeWidth="0.5"/>
      <rect x="3" y="8" width="4" height="3" fill="#e8c840" stroke="#a0983a" strokeWidth="0.5"/>
      <rect x="3" y="12" width="4" height="3" fill="#e8c840" stroke="#a0983a" strokeWidth="0.5"/>
    </svg>
  ),
}

export function getIcon(iconId) {
  return appIcons[iconId] || null
}

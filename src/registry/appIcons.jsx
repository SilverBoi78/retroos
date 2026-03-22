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
  filemanager: (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="8" width="26" height="20" rx="1" fill="#e8c840" stroke="#a0983a" strokeWidth="1"/>
      <rect x="3" y="6" width="14" height="4" rx="1" fill="#e8c840" stroke="#a0983a" strokeWidth="1"/>
      <rect x="5" y="12" width="22" height="14" fill="#fffff0" stroke="#a0983a" strokeWidth="0.5"/>
      <line x1="5" y1="16" x2="27" y2="16" stroke="#d4d0c8" strokeWidth="0.5"/>
      <line x1="5" y1="20" x2="27" y2="20" stroke="#d4d0c8" strokeWidth="0.5"/>
      <line x1="5" y1="24" x2="27" y2="24" stroke="#d4d0c8" strokeWidth="0.5"/>
    </svg>
  ),
  realms: (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 3 L6 12 L6 26 L16 30 L26 26 L26 12 Z" fill="#6b4c8a" stroke="#3a2a5a" strokeWidth="1"/>
      <path d="M16 5 L8 12 L8 25 L16 28 L24 25 L24 12 Z" fill="#8a6aaa" stroke="none"/>
      <path d="M16 8 L16 24" stroke="#e8c840" strokeWidth="1.5"/>
      <path d="M11 14 L21 14" stroke="#e8c840" strokeWidth="1.5"/>
      <path d="M11 14 L11 11 L13 14" stroke="#e8c840" strokeWidth="1" fill="none"/>
      <path d="M21 14 L21 11 L19 14" stroke="#e8c840" strokeWidth="1" fill="none"/>
      <circle cx="16" cy="20" r="2" fill="#e8c840"/>
    </svg>
  ),
  personalization: (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="4" width="26" height="20" rx="1" fill="#2c5f6e" stroke="#58585a" strokeWidth="1"/>
      <rect x="5" y="6" width="10" height="8" fill="#d4d0c8" stroke="#808080" strokeWidth="0.5"/>
      <rect x="5" y="6" width="10" height="3" fill="#6b4c8a"/>
      <rect x="7" y="16" width="6" height="4" rx="1" fill="#e8c840"/>
      <rect x="15" y="16" width="6" height="4" rx="1" fill="#6b4c8a"/>
      <rect x="23" y="16" width="6" height="4" rx="1" fill="#5a8a5a"/>
      <rect x="3" y="22" width="26" height="3" fill="#d4d0c8" stroke="#808080" strokeWidth="0.5"/>
    </svg>
  ),
}

export function getIcon(iconId) {
  return appIcons[iconId] || null
}

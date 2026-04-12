import { retroClassic, arctic, olive } from './themes'

export const themes = {
  [retroClassic.id]: retroClassic,
  [arctic.id]: arctic,
  [olive.id]: olive,
}

export const defaultThemeId = 'retro-classic'

let customTheme = null

export function registerCustomTheme(theme) {
  customTheme = theme
}

export function getCustomTheme() {
  return customTheme
}

export function getTheme(id) {
  if (id === 'custom' && customTheme) return customTheme
  return themes[id] || themes[defaultThemeId]
}

export function getThemeList() {
  const list = Object.values(themes).map(t => ({ id: t.id, name: t.name }))
  if (customTheme) list.push({ id: 'custom', name: customTheme.name || 'Custom Theme' })
  return list
}

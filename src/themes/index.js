import { retroClassic, arctic, olive } from './themes'

export const themes = {
  [retroClassic.id]: retroClassic,
  [arctic.id]: arctic,
  [olive.id]: olive,
}

export const defaultThemeId = 'retro-classic'

export function getTheme(id) {
  return themes[id] || themes[defaultThemeId]
}

export function getThemeList() {
  return Object.values(themes).map(t => ({ id: t.id, name: t.name }))
}

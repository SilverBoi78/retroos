import retroClassic from './retroClassic'
import arctic from './arctic'
import olive from './olive'

export const themes = {
  'retro-classic': retroClassic,
  'arctic': arctic,
  'olive': olive,
}

export const defaultThemeId = 'retro-classic'

export function getTheme(id) {
  return themes[id] || themes[defaultThemeId]
}

export function getThemeList() {
  return Object.values(themes).map(t => ({ id: t.id, name: t.name }))
}
